from time import sleep
from rest_framework.views import APIView
from rest_framework.response import Response
import azure.cognitiveservices.speech as speechsdk
import json
import os
from datetime import datetime
from django.conf import settings
from pydub import AudioSegment

class RecognizeSpeechView(APIView):
    def post(self, request):
        audio_file = request.FILES.get('audio_file')
        if not audio_file:
            return Response({'error': 'No audio file provided'}, status=400)

        now = datetime.now().timestamp()
        original_file_name = str(now) + "_original.wav"
        wav_file_name = str(now) + ".wav"
        original_file_path = os.path.join(settings.MEDIA_ROOT, "user_audio", original_file_name)
        wav_file_path = os.path.join(settings.MEDIA_ROOT, "user_audio", wav_file_name)
        print(wav_file_path)
        try:
            # 오리지널 WAV 파일을 서버에 임시로 저장
            with open(original_file_path, 'wb') as f:
                for chunk in audio_file.chunks():
                    f.write(chunk)

            # 요구사항에 맞게 WAV 파일 변환
            audio = AudioSegment.from_file(original_file_path)
            audio = audio.set_frame_rate(16000).set_sample_width(2).set_channels(1)
            audio.export(wav_file_path, format="wav")
        except Exception as e:
            return Response({'error': str(e)}, status=500)
            
        file_path = settings.SERVER_URL + "media/user_audio/"+ wav_file_name
        print(file_path)
        with open("key.json", "r") as f:
            key = json.load(f)
        speech_config = speechsdk.SpeechConfig(subscription=key["speech_key"], region=key["service_region"])
        speech_config.speech_recognition_language = "ko-KR"
        audio_config = speechsdk.audio.AudioConfig(filename=wav_file_path)
        speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        speech_recognition_result = speech_recognizer.recognize_once_async().get()

        result = {}
        if speech_recognition_result.reason == speechsdk.ResultReason.RecognizedSpeech:
            result['text'] = speech_recognition_result.text
        elif speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
            result['error'] = "No speech could be recognized: {}".format

        return Response(result)
