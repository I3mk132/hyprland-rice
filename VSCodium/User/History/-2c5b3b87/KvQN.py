import os
import time
import re
from PIL import Image
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from google import genai
from dotenv import load_dotenv

load_dotenv()

USERNAME = os.getenv("OBS_USERNAME")
PASSWORD = os.getenv("OBS_PASSWORD")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
OBS_LOGIN_URL = "https://obs.yildiz.edu.tr/oibs/std/login.aspx"
GRADES_FILE = "/tmp/obs_last_grades.txt"

os.environ["DISPLAY"] = ":0"
os.environ["DBUS_SESSION_BUS_ADDRESS"] = f"unix:path=/run/user/{os.getuid()}/bus"

def solve_captcha_with_gemini():
    try:
        client = genai.Client(api_key=GEMINI_KEY)
        image = Image.open("captcha.png")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                image,
                "This is a math captcha from a university website. Solve the equation in the image (e.g., if it's 39+4, answer is 43). Return ONLY the final numeric result as a single integer, nothing else."
            ]
        )
        result = response.text.strip()
        print(f"[🎉] Gemini حل الكابتشا: {result}")
        if result.isdigit():
            return result
        else:
            numbers = re.findall(r'\d+', result)
            return numbers[0] if numbers else None
    except Exception as e:
        print(f"[-] خطأ في Gemini API: {e}")
        return None

def solve_captcha(driver):
    try:
        time.sleep(3)
        driver.save_screenshot("full_page.png")
        captcha_element = driver.find_element(By.ID, "imgCaptchaImg")
        location = captcha_element.location
        size = captcha_element.size
        img = Image.open("full_page.png")
        captcha_img = img.crop((
            location['x'], location['y'],
            location['x'] + size['width'],
            location['y'] + size['height']
        ))
        captcha_img.save("captcha.png")
        print("[+] تم التقاط الكابتشا.")
        return solve_captcha_with_gemini()
    except Exception as e:
        print(f"[-] خطأ في معالجة الكابتشا: {e}")
        return None

def wait_for_grades_table(driver, wait):
    """
    ينتظر تحميل الجدول بثلاث طرق متتالية للتأكد من نجاح الاستخراج
    """
    # الطريقة 1: انتظار ظهور الـ UpdatePanel أولاً
    try:
        wait.until(EC.presence_of_element_located((By.ID, "UpdatePanel1")))
        print("[+] UpdatePanel1 موجود.")
    except:
        print("[~] UpdatePanel1 غير موجود، نكمل...")

    # الطريقة 2: انتظار الجدول نفسه
    for attempt in range(3):
        try:
            table = wait.until(EC.presence_of_element_located((By.ID, "grd_not_listesi")))
            text = table.text.strip()
            if text:
                print(f"[+] تم استخراج الجدول (المحاولة {attempt+1})")
                return text
            else:
                print(f"[~] الجدول موجود لكن فارغ، انتظار... (المحاولة {attempt+1})")
                time.sleep(3)
        except Exception as e:
            print(f"[-] المحاولة {attempt+1} فشلت: {e}")
            time.sleep(3)

    # الطريقة 3: استخراج بـ JavaScript مباشرة كحل أخير
    print("[*] محاولة استخراج البيانات عبر JavaScript...")
    try:
        result = driver.execute_script("""
            var table = document.getElementById('grd_not_listesi');
            if (!table) return null;
            var rows = table.querySelectorAll('tr');
            var data = [];
            rows.forEach(function(row) {
                var cells = row.querySelectorAll('td, th');
                var rowData = [];
                cells.forEach(function(cell) {
                    rowData.push(cell.innerText.trim());
                });
                if (rowData.length > 0) data.push(rowData.join(' | '));
            });
            return data.join('\\n');
        """)
        if result:
            print("[+] تم استخراج البيانات عبر JavaScript!")
            return result
    except Exception as e:
        print(f"[-] JavaScript extraction فشل: {e}")

    return None

def check_obs():
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    # مهم: يمنع مشاكل الـ iframe مع الـ CORS
    options.add_argument("--disable-web-security")
    options.add_argument("--disable-site-isolation-trials")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    try:
        print("[*] جاري فتح موقع OBS...")
        driver.get(OBS_LOGIN_URL)
        time.sleep(3)

        driver.find_element(By.ID, "txtParamT01").send_keys(USERNAME)
        driver.find_element(By.ID, "txtParamT02").send_keys(PASSWORD)

        captcha_solution = solve_captcha(driver)
        if not captcha_solution:
            print("[-] فشل حل الكابتشا، إلغاء العملية.")
            return

        driver.find_element(By.ID, "txtSecCode").send_keys(captcha_solution)
        driver.find_element(By.ID, "btnLogin").click()
        print("[*] تم الضغط على زر الدخول...")

        wait = WebDriverWait(driver, 30)  # زيادة المهلة لـ 30 ثانية

        # الانتظار حتى يتحمل الـ iframe
        print("[*] انتظار الـ iframe...")
        wait.until(EC.frame_to_be_available_and_switch_to_it((By.NAME, "IFRAME1")))
        print("[+] تم التحويل للـ iframe.")

        # انتظار إضافي لتحميل الـ AJAX داخل الـ iframe
        time.sleep(5)

        current_grades_text = wait_for_grades_table(driver, wait)

        if not current_grades_text:
            print("[-] فشل استخراج بيانات الجدول بجميع الطرق.")
            driver.save_screenshot("debug_screenshot.png")
            print("[*] تم حفظ لقطة شاشة للتشخيص: debug_screenshot.png")
            return

        print("\n--- 📝 الدرجات الحالية ---")
        print(current_grades_text)
        print("--------------------------\n")

        if os.path.exists(GRADES_FILE):
            with open(GRADES_FILE, "r", encoding="utf-8") as f:
                old_grades_text = f.read()

            if current_grades_text != old_grades_text:
                print("[🔥] تغيير في العلامات!")
                os.system('notify-send "تحديث OBS" "🔥 نزلت علامات جديدة!" -u critical -i dialog-information')
                with open(GRADES_FILE, "w", encoding="utf-8") as f:
                    f.write(current_grades_text)
            else:
                print("[~] لا يوجد تغيير في الدرجات.")
        else:
            print("[*] أول تشغيل: حفظ الحالة الحالية...")
            with open(GRADES_FILE, "w", encoding="utf-8") as f:
                f.write(current_grades_text)

    except Exception as e:
        print(f"[-] خطأ غير متوقع: {e}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()
        for f in ["full_page.png", "captcha.png"]:
            if os.path.exists(f):
                os.remove(f)

if __name__ == "__main__":
    print("[+] تشغيل سكربت مراقبة OBS...")
    check_obs()