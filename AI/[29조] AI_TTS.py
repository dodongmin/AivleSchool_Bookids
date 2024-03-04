def TTS(text):
    with open ("key.json", "r") as f:
        key = json.load(f)
        
    speech_config = speechsdk.SpeechConfig(subscription=key['speech_key'], region=key['service_region'])
    speech_config.speech_synthesis_voice_name = "ko-KR-SoonBokNeural"
    speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)
    result = speech_synthesizer.speak_text_async(text).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        audio_data = result.audio_data
        now = datetime.now().timestamp()
        file_name = str(now) + ".mp3"
        file_path = os.path.join(settings.MEDIA_ROOT, "audio", file_name)
        
        with wave.open(file_path, 'wb') as wave_file:
            wave_file.setnchannels(1)
            wave_file.setsampwidth(2)
            wave_file.setframerate(16000) 
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