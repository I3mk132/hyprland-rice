import os
import time
import re
from PIL import Image
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv

load_dotenv();

# --- إعدادات الحساب والموقع ---
USERNAME = os.getenv("OBS_USERNAME")
PASSWORD = os.getenv("OBS_PASSWORD")
OBS_LOGIN_URL = "https://obs.yildiz.edu.tr/oibs/std/login.aspx"

def solve_captcha(driver):
    # 1. ابحث عن عنصر صورة الكابتشا في الصفحة
    captcha_element = driver.find_element(By.ID, "imgCaptcha") # تأكد من الـ ID من الـ Inspect Element
    
    # 2. خذ لقطة شاشة للصفحة واحفظ صورة الكابتشا فقط
    captcha_element.screenshot("captcha.png")
    
    # 3. معالجة الصورة باستخدام Tesseract لقراءة الأرقام
    try:
        import pytesseract
        # تنظيف النص المستخرج
        text = pytesseract.image_to_string(Image.open("captcha.png"))
        print(f"[+] النص المستخرج من الكابتشا: {text}")
        
        # استخراج الأرقام باستخدام Regular Expressions (مثال: 39 + 4)
        numbers = [int(s) for s in re.findall(r'\d+', text)]
        
        if len(numbers) >= 2:
            result = numbers[0] + numbers[1]
            print(f"[+] ناتج حل الكابتشا: {result}")
            return str(result)
        else:
            return None
    except Exception as e:
        print(f"[-] خطأ أثناء تحليل الكابتشا: {e}")
        return None

def check_obs():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless") # تشغيل مخفي بدون واجهة رسومية
    options.add_argument("--disable-gpu")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        driver.get(OBS_LOGIN_URL)
        time.sleep(2)
        
        # إدخال بيانات تسجيل الدخول
        driver.find_element(By.ID, "txtParam1").send_keys(USERNAME) # حقل اسم المستخدم
        driver.find_element(By.ID, "txtParam2").send_keys(PASSWORD) # حقل كلمة المرور
        
        # حل الكابتشا وإدخالها
        captcha_solution = solve_captcha(driver)
        if not captcha_solution:
            print("[-] فشل استخراج أرقام الكابتشا، سنحاول مرة أخرى في الدورة القادمة.")
            return
            
        driver.find_element(By.ID, "txtCaptcha").send_keys(captcha_solution) # حقل حل الكابتشا
        
        # ضغط زر تسجيل الدخول
        driver.find_element(By.ID, "btnLogin").click()
        time.sleep(3)
        
        # --- التحقق من نجاح الدخول والانتقال لصفحة العلامات ---
        # إذا نجح الدخول، ننتقل لصفحة العلامات ونفحص النص
        # driver.get("رابط_صفحة_الدرجات_الداخلي")
        
        # (هنا تضع منطق مقارنة جدول الدرجات القديم بالجديد الذي شرحناه سابقاً)
        # current_grades = driver.find_element(By.CLASS_NAME, "table_class").text
        
        # إشعار تجريبي للتأكد من عمل السكربت
        # os.system('notify-send "OBS Script" "تم الفحص بنجاح!"')
        
    except Exception as e:
        print(f"[-] حدث خطأ في السكربت: {e}")
    finally:
        driver.quit()
        # تنظيف الصورة المؤقتة
        if os.path.exists("captcha.png"):
            os.remove("captcha.png")

if __name__ == "__main__":
    check_obs()