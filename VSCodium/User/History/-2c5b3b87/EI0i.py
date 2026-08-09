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

# تحميل متغيرات البيئة الحساسة (.env)
load_dotenv()

USERNAME = os.getenv("OBS_USERNAME")
PASSWORD = os.getenv("OBS_PASSWORD")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
OBS_LOGIN_URL = "https://obs.yildiz.edu.tr/oibs/std/login.aspx"
GRADES_FILE = "/tmp/obs_last_grades.txt"

# إعداد متغيرات البيئة لـ Wayland/Hyprland لتشغيل الإشعارات في الخلفية بأمان
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
                "This is a math captcha from a website university system. Solve the equation in the image (e.g., if it's 39+4, calculate 43). Return ONLY the final numeric result as a single integer, nothing else. No text, no explanation."
            ]
        )
        
        result = response.text.strip()
        print(f"[🎉] ذكاء جيميناي حل الكابتشا: {result}")
        
        if result.isdigit():
            return result
        else:
            numbers = re.findall(r'\d+', result)
            return numbers[0] if numbers else None
            
    except Exception as e:
        print(f"[-] خطأ أثناء استدعاء Gemini API: {e}")
        return None

def solve_captcha(driver):
    try:
        time.sleep(3)
        driver.save_screenshot("full_page.png")
        
        captcha_element = driver.find_element(By.ID, "imgCaptchaImg")
        location = captcha_element.location
        size = captcha_element.size
        
        left = location['x']
        top = location['y']
        right = location['x'] + size['width']
        bottom = location['y'] + size['height']
        
        img = Image.open("full_page.png")
        captcha_img = img.crop((left, top, right, bottom))
        captcha_img.save("captcha.png")
        print("[+] تم التقاط لقطة الكابتشا بنجاح.")
        
        return solve_captcha_with_gemini()
            
    except Exception as e:
        print(f"[-] خطأ أثناء تصوير ومعالجة الكابتشا: {e}")
        return None

def check_obs():
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless") # فعلها لاحقاً للتشغيل الصامت بالخلفية
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        print("[*] جاري فتح موقع OBS...")
        driver.get(OBS_LOGIN_URL)
        time.sleep(3)
        
        # إدخال البيانات
        driver.find_element(By.ID, "txtParamT01").send_keys(USERNAME)
        driver.find_element(By.ID, "txtParamT02").send_keys(PASSWORD)
        
        captcha_solution = solve_captcha(driver)
        if not captcha_solution:
            print("[-] إلغاء العملية لتجنب الحظر بسبب عدم الحصول على حل للكابتشا.")
            return
            
        driver.find_element(By.ID, "txtSecCode").send_keys(captcha_solution)
        
        # ضغط زر الدخول
        driver.find_element(By.ID, "btnLogin").click()
        print("[*] تم ضغط زر الدخول، جاري انتظار تحميل الإطار الرئيسي...")
        
        # الانتظار الذكي حتى يظهر الـ iframe أولاً ويتأكد من تحميل الصفحة الخارجية
        # ينتظر حتى 15 ثانية كحد أقصى ليتحمل الفريم تماماً
        wait = WebDriverWait(driver, 15)
        wait.until(EC.frame_to_be_available_and_switch_to_it((By.NAME, "IFRAME1")))
        print("[+] تم رصد الغرفة الداخلية والتحويل لـ iframe بنجاح.")
        
        # الآن نستخدم الانتظار الذكي داخل الـ iframe لينتظر ظهور جدول الدرجات برقم الـ ID حقه
        print("[*] جاري انتظار ظهور جدول الدرجات (grd_not_listesi) على الشاشة...")
        try:
            # ينتظر حتى يصبح الجدول مرئياً وقابلاً للقراءة
            grades_table = wait.until(EC.visibility_of_element_located((By.ID, "grd_not_listesi")))
            current_grades_text = grades_table.text
            
            print("[+] تم قراءة جدول الدرجات الحالي بنجاح!")
            print("\n--- 📝 الدرجات التي تم رصدها الآن ---")
            print(current_grades_text)
            print("------------------------------------\n")
            
            # منطق المقارنة والإشعار لسطح المكتب
            if os.path.exists(GRADES_FILE):
                with open(GRADES_FILE, "r", encoding="utf-8") as f:
                    old_grades_text = f.read()
                
                if current_grades_text != old_grades_text:
                    print("[🔥] رصد تغيير في العلامات!")
                    os.system('notify-send "تحديث الـ OBS" "🔥 نزلت علامات جديدة! افتح الموقع فوراً." -u critical -i dialog-information')
                    
                    with open(GRADES_FILE, "w", encoding="utf-8") as f:
                        f.write(current_grades_text)
                else:
                    print("[~] لا يوجد تغيير في الدرجات حتى الآن.")
            else:
                print("[*] التشغيل الأول: جاري حفظ الحالة الحالية للدرجات...")
                with open(GRADES_FILE, "w", encoding="utf-8") as f:
                    f.write(current_grades_text)
                    
        except Exception as table_error:
            print(f"[-] انتهت مهلة الانتظار ولم يظهر الجدول على الشاشة بعد تسجيل الدخول: {table_error}")
            
    except Exception as e:
        print(f"[-] حدث خطأ غير متوقع في السكربت: {e}")
    finally:
        driver.quit()
        if os.path.exists("full_page.png"): os.remove("full_page.png")
        if os.path.exists("captcha.png"): os.remove("captcha.png")

if __name__ == "__main__":
    print("[+] تم تشغيل سكربت مراقبة الـ OBS بنجاح...")
    check_obs()