import os
import time
import re
from PIL import Image
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
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
        # استدعاء عميل جيميناي باستخدام المفتاح الجديد
        client = genai.Client(api_key=GEMINI_KEY)
        
        # فتح صورة الكابتشا المقصوصة
        image = Image.open("captcha.png")
        
        # إرسال الصورة مع برومبت صارم لاستخراج الرقم فقط
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                image, 
                "This is a math captcha from a website university system. Solve the equation in the image (e.g., if it's 39+4, calculate 43). Return ONLY the final numeric result as a single integer, nothing else. No text, no explanation."
            ]
        )
        
        result = response.text.strip()
        print(f"[🎉] ذكاء جيميناي حل الكابتشا: {result}")
        
        # التأكد التام أن المخرج عبارة عن رقم فقط
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
        time.sleep(3) # انتظر حتى يكتمل تحميل الصفحة
        
        # 1. خذ لقطة شاشة كاملة للموقع
        driver.save_screenshot("full_page.png")
        print("[+] تم حفظ لقطة الشاشة الكاملة.")
        
        # 2. ابحث عن موقع عنصر الكابتشا وأبعاده على الشاشة
        captcha_element = driver.find_element(By.ID, "imgCaptchaImg")
        location = captcha_element.location
        size = captcha_element.size
        
        # 3. حساب إحداثيات مربع الكابتشا بدقة لقصها
        left = location['x']
        top = location['y']
        right = location['x'] + size['width']
        bottom = location['y'] + size['height']
        
        # 4. فتح الصورة الكاملة وقص الكابتشا وحفظها
        img = Image.open("full_page.png")
        captcha_img = img.crop((left, top, right, bottom))
        captcha_img.save("captcha.png")
        print("[+] تم التقاط لقطة الكابتشا بنجاح.")
        
        # 5. الاستعانة بـ Gemini لحل المعادلة
        return solve_captcha_with_gemini()
            
    except Exception as e:
        print(f"[-] خطأ أثناء تصوير ومعالجة الكابتشا: {e}")
        return None

def check_obs():
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless")  # معطلة مؤقتاً لتشاهد الدخول بعينك، فعلها لاحقاً بالخلفية
    options.add_argument("--disable-gpu")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        print("[*] جاري فتح موقع OBS...")
        driver.get(OBS_LOGIN_URL)
        time.sleep(3)
        
        # إدخل بيانات الحساب
        driver.find_element(By.ID, "txtParamT01").send_keys(USERNAME)
        driver.find_element(By.ID, "txtParamT02").send_keys(PASSWORD)
        
        captcha_solution = solve_captcha(driver)
        if not captcha_solution:
            print("[-] إلغاء العملية لتجنب الحظر بسبب عدم دقة الكابتشا.")
            return
            
        driver.find_element(By.ID, "txtSecCode").send_keys(captcha_solution)
        
        # ضغط زر تسجيل الدخول
        driver.find_element(By.ID, "btnLogin").click()
        time.sleep(5) 
        
        # 1. الانتقال إلى الـ iframe برمجياً لرؤية الجدول الداخلي للعلامات
        print("[*] محاولة الدخول إلى الـ iframe...")
        driver.switch_to.frame("IFRAME1")
        time.sleep(2)
        
        # 2. استخراج نص الجدول باستخدام الكلاس grdStyle
        try:
            grades_table = driver.find_element(By.CLASS_NAME, "grdStyle")
            current_grades_text = grades_table.text
            print("[+] تم قراءة جدول الدرجات الحالي بنجاح.")
            print("\n--- 📝 الدرجات التي تم رصدها الآن ---")
            print(current_grades_text)
            print("------------------------------------\n")
            
            # 3. منطق المقارنة والإشعار
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
            print(f"[-] لم يتم العثور على جدول الدرجات (grdStyle). تأكد من نجاح الدخول يدوياً: {table_error}")
            
    except Exception as e:
        print(f"[-] حدث خطأ غير متوقع في السكربت: {e}")
    finally:
        driver.quit()
        # تنظيف الصور المؤقتة فوراً
        if os.path.exists("full_page.png"): os.remove("full_page.png")
        if os.path.exists("captcha.png"): os.remove("captcha.png")

if __name__ == "__main__":
    print("[+] تم تشغيل سكربت مراقبة الـ OBS بنجاح...")
    check_obs()