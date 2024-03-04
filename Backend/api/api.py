from datetime import datetime
import azure.cognitiveservices.speech as speechsdk
import azure.cognitiveservices.speech.audio
import wave
from openai import OpenAI
import json
from fairytail import settings
import os



def TTS(text):
    with open ("key.json", "r") as f:
        key = json.load(f)
    speech_config = speechsdk.SpeechConfig(subscription=key['speech_key'], region=key['service_region'])
    # azure 여성음성 리스트
    # ko-KR-SunHiNeural, ko-KR-JiMinNeural, ko-KR-SeoHyeonNeural, ko-KR-SoonBokNeural, ko-KR-YuJinNeural
    speech_config.speech_synthesis_voice_name = "ko-KR-SoonBokNeural"
  
    speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)

    # text = '옛날 옛적 아주 옛적 , 어느 나라 임금 한 분이 잘 생긴 따님을 여러 사람 데리고 계셨었는데'

    result = speech_synthesizer.speak_text_async(text).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        # 오디오 파일 저장
        audio_data = result.audio_data
        now = datetime.now().timestamp()
        file_name = str(now) + ".mp3"
        file_path = os.path.join(settings.MEDIA_ROOT, "audio", file_name)

        with wave.open(file_path, 'wb') as wave_file:
            wave_file.setnchannels(1)
            wave_file.setsampwidth(2)
            wave_file.setframerate(16000)  # Adjust the sample rate if needed
            wave_file.writeframes(audio_data)

        print(f"Speech synthesized to {file_path}")
        
        return settings.SERVER_URL + "media/audio/"+ file_name
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = result.cancellation_details
        print("Speech synthesis canceled: {}".format(cancellation_details.reason))
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            if cancellation_details.error_details:
                print("Error details: {}".format(cancellation_details.error_details))
        print("Did you update the subscription info?")

def ChatGPT(sys_content, option, content):
    with open ("key.json", "r") as f:
        key = json.load(f)
    client = OpenAI(api_key=key['gpt_key'])

    response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {
        "role": "system",
        "content": sys_content
        },
        {
        "role": "user",
        "content": content + " " + option
        },
    ],
    temperature=1,
    max_tokens=256,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0
    )
    return response