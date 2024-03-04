import os
import azure.cognitiveservices.speech as speechsdk

def recognize_from_wav_file(wav_file_path):
    #speech_key 내 생성 리소스 키1
    #service_region 내 생성 리소스 위치/지역 
    #speech_key, service_region = 
    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
    speech_config.speech_recognition_language = "ko-KR" 

    audio_config = speechsdk.audio.AudioConfig(filename=wav_file_path)

    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

    print("Recognizing speech from the provided .wav file...")
    speech_recognition_result = speech_recognizer.recognize_once_async().get()

    # Check the result.
    if speech_recognition_result.reason == speechsdk.ResultReason.RecognizedSpeech:
        print("Recognized: {}".format(speech_recognition_result.text))
    elif speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
        print("No speech could be recognized: {}".format(speech_recognition_result.no_match_details))
    elif speech_recognition_result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = speech_recognition_result.cancellation_details
        print("Speech Recognition canceled: {}".format(cancellation_details.reason))
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print("Error details: {}".format(cancellation_details.error_details))
            print("Did you set the speech resource key and region values?")

wav_file_path = "K00017938-BFG23-L1N2D1-E-K0KK-03989248.wav"

recognize_from_wav_file(wav_file_path)
