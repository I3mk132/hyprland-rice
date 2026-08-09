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
# URL صفحة الدرجات مباشرة
GRADES_URL = "https://obs.yildiz.edu.tr/oibs/std/index.aspx?curOp=0#"
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
                "This is a math captcha from a university website. Solve the equation in the image. Return ONLY the final numeric result as a single integer, nothing else."
            ]
        )
        result = response.text.strip()
        print(f"[🎉] Gemini حل الكابتشا: {result}")
        if result.isdigit():
            return result
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

def navigate_to_grades(driver, wait):
    """الانتقال لصفحة الدرجات عبر الـ URL المباشر أو عبر الـ curOp"""
    try:
        # الطريقة 1: تغيير الـ URL مباشرة لصفحة الدرجات
        print("[*] الانتقال لصفحة الدرجات مباشرة...")
        driver.get("https://obs.yildiz.edu.tr/oibs/std/index.aspx?curOp=0")
        time.sleep(4)

        # الطريقة 2: البحث عن رابط الدرجات في القائمة
        # لو ما اشتغل نبحث عن "Özet Not Durumu" في الـ sidebar
        try:
            grades_link = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//a[contains(text(), 'Not') or contains(text(), 'Özet')]")
            ))
            grades_link.click()
            print("[+] تم الضغط على رابط الدرجات.")
            time.sleep(3)
        except:
            print("[~] لم يُعثر على رابط الدرجات في القائمة، نكمل بالـ URL.")

        return True
    except Exception as e:
        print(f"[-] فشل الانتقال لصفحة الدرجات: {e}")
        return False

def extract_grades_from_iframe(driver, wait):
    """الدخول للـ iframe واستخراج جدول الدرجات"""
    
    # الانتظار حتى يظهر الـ iframe
    print("[*] انتظار الـ iframe...")
    try:
        wait.until(EC.frame_to_be_available_and_switch_to_it((By.NAME, "IFRAME1")))
        print("[+] تم التحويل للـ iframe.")
    except Exception as e:
        print(f"[-] لم يُعثر على IFRAME1: {e}")
        # محاولة بـ ID أو CSS
        try:
            wait.until(EC.frame_to_be_available_and_switch_to_it((By.TAG_NAME, "iframe")))
            print("[+] تم التحويل لأول iframe.")
        except Exception as e2:
            print(f"[-] فشل إيجاد أي iframe: {e2}")
            return None

    # انتظار تحميل الـ AJAX
    time.sleep(5)

    # محاولة 1: انتظار الجدول مباشرة
    for attempt in range(4):
        try:
            table = driver.find_element(By.ID, "grd_not_listesi")
            text = table.text.strip()
            if text and len(text) > 10:
                print(f"[+] تم استخراج الجدول! (المحاولة {attempt+1})")
                return text
            else:
                print(f"[~] الجدول فارغ، انتظار... (المحاولة {attempt+1})")
                time.sleep(4)
        except Exception as e:
            print(f"[-] المحاولة {attempt+1}: {e}")
            time.sleep(4)

    # محاولة 2: JavaScript
    print("[*] محاولة JavaScript...")
    try:
        result = driver.execute_script("""
            var table = document.getElementById('grd_not_listesi');
            if (!table) return 'TABLE_NOT_FOUND';
            var rows = table.querySelectorAll('tr');
            var data = [];
            rows.forEach(function(row) {
                var cells = row.querySelectorAll('td, th');
                var rowData = [];
                cells.forEach(function(cell) {
                    rowData.push(cell.innerText.trim());
                });
                if (rowData.some(c => c.length > 0)) {
                    data.push(rowData.join(' | '));
                }
            });
            return data.length > 0 ? data.join('\\n') : 'EMPTY_TABLE';
        """)
        print(f"[*] نتيجة JavaScript: {result[:100] if result else 'None'}...")
        if result and result not in ['TABLE_NOT_FOUND', 'EMPTY_TABLE']:
            return result
        elif result == 'TABLE_NOT_FOUND':
            print("[-] الجدول غير موجود في الـ DOM!")
    except Exception as e:
        print(f"[-] JavaScript فشل: {e}")

    return None

def check_obs():
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    try:
        print("[+] تشغيل سكربت مراقبة OBS...")
        driver.get(OBS_LOGIN_URL)
        time.sleep(3)

        driver.find_element(By.ID, "txtParamT01").send_keys(USERNAME)
        driver.find_element(By.ID, "txtParamT02").send_keys(PASSWORD)

        captcha_solution = solve_captcha(driver)
        if not captcha_solution:
            print("[-] فشل حل الكابتشا، إلغاء.")
            return

        driver.find_element(By.ID, "txtSecCode").send_keys(captcha_solution)
        driver.find_element(By.ID, "btnLogin").click()
        print("[*] تم الضغط على زر الدخول...")

        wait = WebDriverWait(driver, 30)

        # انتظار تحميل Dashboard (التأكد من نجاح اللوجين)
        try:
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, "main-header")))
            print("[+] تم تسجيل الدخول بنجاح!")
        except:
            print("[~] لم يتأكد من اللوجين، نكمل...")

        time.sleep(3)

        # *** الخطوة المهمة: الانتقال لصفحة الدرجات ***
        navigate_to_grades(driver, wait)

        # استخراج الدرجات من الـ iframe
        current_grades_text = extract_grades_from_iframe(driver, wait)

        if not current_grades_text:
            print("[-] فشل استخراج الدرجات.")
            # حفظ screenshot للتشخيص
            driver.switch_to.default_content()
            driver.save_screenshot("debug_screenshot.png")
            print("[*] تم حفظ debug_screenshot.png")
            return

        print("\n--- 📝 الدرجات ---")
        print(current_grades_text)
        print("------------------\n")

        if os.path.exists(GRADES_FILE):
            with open(GRADES_FILE, "r", encoding="utf-8") as f:
                old_grades = f.read()
            if current_grades_text != old_grades:
                print("[🔥] تغيير في العلامات!")
                os.system('notify-send "تحديث OBS" "🔥 نزلت علامات جديدة!" -u critical')
                with open(GRADES_FILE, "w", encoding="utf-8") as f:
                    f.write(current_grades_text)
            else:
                print("[~] لا يوجد تغيير.")
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
    check_obs()