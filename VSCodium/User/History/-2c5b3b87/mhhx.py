import os
import time
import re
from PIL import Image
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv

# تحميل متغيرات البيئة الحساسة
load_dotenv()

USERNAME = os.getenv("OBS_USERNAME")
PASSWORD = os.getenv("OBS_PASSWORD")
OBS_LOGIN_URL = "https://obs.yildiz.edu.tr/oibs/std/login.aspx"
GRADES_FILE = "/tmp/obs_last_grades.txt"

# إعداد متغيرات البيئة لـ Wayland/Hyprland لتشغيل الإشعارات في الخلفية بأمان
os.environ["DISPLAY"] = ":0"
os.environ["DBUS_SESSION_BUS_ADDRESS"] = f"unix:path=/run/user/{os.getuid()}/bus"

def solve_captcha(driver):
    try:
        captcha_element = driver.find_element(By.ID, "imgCaptchaImg")
        captcha_element.screenshot("captcha.png")
        
        import pytesseract
        text = pytesseract.image_to_string(Image.open("captcha.png"))
        print(f"[+] النص المستخرج من الكابتشا: {text.strip()}")
        
        numbers = [int(s) for s in re.findall(r'\d+', text)]
        
        if len(numbers) >= 2:
            result = numbers[0] + numbers[1]
            print(f"[+] ناتج حل الكابتشا: {result}")
            return str(result)
        else:
            print("[-] لم يتم العثور على رقمين في صورة الكابتشا.")
            return None
    except Exception as e:
        print(f"[-] خطأ أثناء تحليل الكابتشا: {e}")
        return None

def check_obs():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # تشغيل مخفي بالخلفية
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080") # تحديد أبعاد الشاشة لضمان ظهور العناصر
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        print("[*] جاري فتح موقع OBS...")
        driver.get(OBS_LOGIN_URL)
        time.sleep(3)
        
        # إدخال بيانات الحساب بناءً على الـ IDs الجديدة
        driver.find_element(By.ID, "txtParamT01").send_keys(USERNAME)
        driver.find_element(By.ID, "txtParamT02").send_keys(PASSWORD)
        
        captcha_solution = solve_captcha(driver)
        if not captcha_solution:
            return
            
        driver.find_element(By.ID, "txtSecCode").send_keys(captcha_solution)
        
        # ضغط زر تسجيل الدخول
        driver.find_element(By.ID, "btnLogin").click()
        time.sleep(5) # وقت كافٍ لتخطي الدخول وتحميل الصفحة الرئيسية والتنقل الداخلي للـ SPA
        
        # 1. الانتقال إلى الـ iframe برمجياً لرؤية الجدول الداخلي
        print("[*] محاولة الدخول إلى الـ iframe...")
        driver.switch_to.frame("IFRAME1")
        time.sleep(2)
        
        # 2. استخراج نص الجدول باستخدام الكلاس الظاهر بالصورة grdStyle
        # نستخدم find_element لأنه جدول واحد مخصص للدرجات داخل هذا الإطار
        try:
            grades_table = driver.find_element(By.CLASS_NAME, "grdStyle")
            current_grades_text = grades_table.text
            print("[+] تم قراءة جدول الدرجات الحالي بنجاح.")
            
            # 3. منطق المقارنة والإشعار
            if os.path.exists(GRADES_FILE):
                with open(GRADES_FILE, "r", encoding="utf-8") as f:
                    old_grades_text = f.read()
                
                if current_grades_text != old_grades_text:
                    print("[🔥] رصد تغيير في العلامات!")
                    # إرسال إشعار للنظام عبر notify-send (مستنداً لـ SwayNC أو نظام إشعاراتك)
                    os.system('notify-send "تحديث الـ OBS" "🔥 نزلت علامات جديدة! افتح الموقع فوراً." -u critical -i dialog-information')
                    
                    # تحديث الملف بالحالة الجديدة
                    with open(GRADES_FILE, "w", encoding="utf-8") as f:
                        f.write(current_grades_text)
                else:
                    print("[~] لا يوجد تغيير في الدرجات حتى الآن.")
            else:
                # أول تشغيل للسكربت يقوم فقط بحفظ الوضع الحالي
                print("[*] التشغيل الأول: جاري حفظ الحالة الحالية للدرجات...")
                with open(GRADES_FILE, "w", encoding="utf-8") as f:
                    f.write(current_grades_text)
                    
        except Exception as table_error:
            print(f"[-] لم يتم العثور على جدول الدرجات (grdStyle) داخل الإطار: {table_error}")
            # ربما الكابتشا كانت خاطئة ولم يسجل دخول، سنحاول الدورة القادمة
            
    except Exception as e:
        print(f"[-] حدث خطأ غير متوقع في السكربت: {e}")
    finally:
        driver.quit()
        if os.path.exists("captcha.png"):
            os.remove("captcha.png")

if __name__ == "__main__":
    print("[+] تم تشغيل سكربت مراقبة الـ OBS بنجاح...")
    # حلقة تكرارية ليفحص السكربت كل 15 دقيقة (900 ثانية) تلقائياً في الخلفية
    while True:
        check_obs()
        print("[*] انتظار 15 دقيقة قبل الفحص القادم...")
        time.sleep(900)