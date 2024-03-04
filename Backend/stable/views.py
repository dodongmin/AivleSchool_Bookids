from django.shortcuts import render
 
# Create your views here.
# backend/views.py
 
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import torch
from diffusers import WuerstchenDecoderPipeline, WuerstchenPriorPipeline
from diffusers.pipelines.wuerstchen import DEFAULT_STAGE_C_TIMESTEPS
 
import requests, uuid, json
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
from datetime import datetime
import os 
from api.api import *
import random
 
 
device = 'cuda'
dtype = torch.float16
prior_pipeline = WuerstchenPriorPipeline.from_pretrained("warp-ai/wuerstchen-prior", torch_dtype=dtype).to(device)
decoder_pipeline = WuerstchenDecoderPipeline.from_pretrained("warp-ai/wuerstchen", torch_dtype=dtype).to(device)
num_images_per_prompt = 1
 
#################################################################################
###### 번역, 요약 GPT 함수
###############################
 
@csrf_exempt
def generate_image(request):
    print(request.method)
    if request.method == 'POST':
        try:
            response = ChatGPT("""
                           양식 : , , , , 엔터로 구분하지 말고 쉼표로만 구분해
                           """,
                           " 이 내용 줄거리에서 중요한 단어 5개를 한글 말고 영어로만 말해줘. ",
                           request.POST['content'])
            words = response.choices[0].message.content
            stabledata = words
            #print(request.POST['content'])
            caption = "(Children's Illustration Style),(masterpiece),(cute),highly detailed,mouse," + stabledata
            negative_prompt = '(disfigured), realistic, anime, photographic, cluttered, Not safe for work, strange fingers,bad feet, bad legs'
            print(caption)
 
            prior_output = prior_pipeline(
                prompt=caption,
                height=512,
                width=512,
                timesteps=DEFAULT_STAGE_C_TIMESTEPS,
                negative_prompt=negative_prompt,
                guidance_scale=4.0,
                num_images_per_prompt=num_images_per_prompt,
            )
            decoder_output = decoder_pipeline(
                image_embeddings=prior_output.image_embeddings,
                prompt=caption,
                negative_prompt=negative_prompt,
                guidance_scale=0.0,
                output_type="pil",
            ).images
 
            image = decoder_output[0]
 
            # 이미지를 파일로 저장
            now = datetime.now().timestamp()
            file_name = str(now) + ".png"
            save_path = "media/images/" + file_name
            image.save(save_path)
            print(caption)
            return JsonResponse({'image_path': 'http://34.64.255.242:8000/' + save_path})
        except Exception as e:
            return JsonResponse({'error': str(e)})
 
    return JsonResponse({'error': 'Invalid request method'})
 
@csrf_exempt
def generate_quiz_image(request):
    if request.method == 'POST':
        try:
            # response = ChatGPT("""
            #                양식 : a, b, c, d, e
            #                """,
            #                " 이 내용을 가지고 중요한 단어 5개를 영어로 말해줘",
            #                request.POST['content'])
            word_list = ['apple', 'mouse', 'dog', 'cat']
            random_word = random.choice(word_list)

            caption = "(Children's Illustration Style),(masterpiece),(cute),highly detailed, " + random_word
            negative_prompt = '(disfigured), realistic, anime, photographic, cluttered, Not safe for work, strange fingers,bad feet, bad legs'
 
            prior_output = prior_pipeline(
                prompt=caption,
                height=512,
                width=512,
                timesteps=DEFAULT_STAGE_C_TIMESTEPS,
                negative_prompt=negative_prompt,
                guidance_scale=4.0,
                num_images_per_prompt=num_images_per_prompt,
            )
            decoder_output = decoder_pipeline(
                image_embeddings=prior_output.image_embeddings,
                prompt=caption,
                negative_prompt=negative_prompt,
                guidance_scale=0.0,
                output_type="pil",
            ).images
 
            image = decoder_output[0]
 
            # 이미지를 파일로 저장
            now = datetime.now().timestamp()
            file_name = str(now) + ".png"
            save_path = "media/images/" + file_name
            image.save(save_path)
            print(caption)
            return JsonResponse({'image_path': 'http://34.64.255.242:8000/' + save_path,
                                 'quiz_answer': random_word,})
        except Exception as e:
            return JsonResponse({'error': str(e)})
 
    return JsonResponse({'error': 'Invalid request method'})