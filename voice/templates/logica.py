import pyttsx3 
import speech_recognition as sr
import pywhatkit 

name = 'asistente'
listener = sr.Recognizer()

engine = pyttsx3.init()

voices = engine.getProperty('voices')
engine.setProperty('voice', voices[0].id)


def talk(text):
    engine.say(text)
    engine.runAndWait()

def listen():
    try:
        with sr.Microphone() as source:
            talk('Bienvenido, soy su asistente smart app, ¿en que puedo ayudarle?')
            print("Escuchando...")
            voice = listener.listen(source)
            rec = listener.recognize_google(voice, language='es-CO') 
            rec = rec.lower()
            if name in rec:
                rec = rec.replace(name, '')
                print(rec)
            else:
                talk("Vuelve a intentarlo, no reconozco: " + rec)
    except:
        pass
    return rec

def run():
    rec = listen()
    if 'reproduce' in rec:
        music = rec.replace('reproduce', '')
        talk('Reproduciendo' + music)
        pywhatkit.playonyt(music)
        talk("En proceso...")
        print("Listo! Disfruta :D")

run()
