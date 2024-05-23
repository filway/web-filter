'use client'

import { useEffect, useRef, useState } from 'react'
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
  Category,
  FaceLandmarkerResult,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision'
import { initializeFaceDetection } from '@/utils/initialize'
import { drawPoints, drawFacemarks } from '@/utils/draw'
import {
  calculateEyeAspectRatio,
  calculateMouthAspectRatio,
} from '@/utils/calculations'
import { LoadingSpinner } from '@/components/loading'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // 是否初始化
  const [isInitialized, setIsInitialized] = useState(false)
  // 眼睛纵横比
  const [eyeAspectRatio, setEyeAspectRatio] = useState(0)
  // 嘴巴纵横比
  const [mouthAspectRatio, setMouthAspectRatio] = useState(0)
  const mouthOpenCount = useRef(0)
  const eyeCloseCount = useRef(0)
  const eyeOpenCount = useRef(0)

  const isEyeClosed = useRef(false)
  const isMouthOpen = useRef(false)
  const isEyeOpened = useRef(false)
  useEffect(() => {
    let faceLandmarker: FaceLandmarker
    let animationFrameId: number

    if (!window) return

    const isMobile = window.innerWidth < 640
    const videoWidth = isMobile ? window.innerWidth : 375
    const videoHeight = isMobile ? window.innerHeight : 667

    const videoConstraints: MediaTrackConstraints = {
      facingMode: 'user',
      width: { ideal: videoWidth },
      height: { ideal: videoHeight },
    }

    import('eruda').then((eruda) => eruda.default.init())

    const init = async () => {
      try {
        faceLandmarker = await initializeFaceDetection()
        detectFace()
      } catch (error) {
        console.error('Error initializing face detection', error)
      }
    }

    const draw = (facemarksArray: FaceLandmarkerResult['faceLandmarks']) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx || !canvas) return
      const video = videoRef.current
      if (!video) return

      // drawFacemarks(facemarksArray, canvas, ctx, video, videoWidth, videoHeight)
      drawPoints(facemarksArray, canvas, ctx, video, videoWidth, videoHeight)
    }

    // 判断各种表情, 睁开眼睛，闭上眼睛, 张开嘴巴等等
    const checkEmotion = (
      facemarksArray: FaceLandmarkerResult['faceLandmarks']
    ) => {
      for (const landmarks of facemarksArray) {
        const eyeAspectRatio = calculateEyeAspectRatio(landmarks)
        setEyeAspectRatio(eyeAspectRatio)

        if (eyeAspectRatio < 0.08 && !isEyeClosed.current) {
          eyeCloseCount.current += 1
          isEyeClosed.current = true
          isEyeOpened.current = false
        } else if (eyeAspectRatio > 0.15 && !isEyeOpened.current) {
          eyeOpenCount.current += 1
          isEyeOpened.current = true
          isEyeClosed.current = false
        }

        const mouthAspectRatio = calculateMouthAspectRatio(landmarks)
        setMouthAspectRatio(mouthAspectRatio)

        if (mouthAspectRatio > 0.3 && !isMouthOpen.current) {
          mouthOpenCount.current += 1
          isMouthOpen.current = true
        } else if (mouthAspectRatio <= 0.3) {
          isMouthOpen.current = false
        }
      }
    }

    const detectFace = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const detections = faceLandmarker.detectForVideo(
          videoRef.current,
          performance.now()
        )
        if (detections.faceLandmarks) {
          draw(detections.faceLandmarks)
          checkEmotion(detections.faceLandmarks)
        }
      }
      animationFrameId = requestAnimationFrame(detectFace)
    }

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await init()
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('Error accessing webcam', error)
      }
    }

    startWebcam()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
      if (faceLandmarker) {
        faceLandmarker.close()
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return (
    <div className='w-full h-full absolute inset-0 flex justify-center sm:max-w-[375px] sm:max-h-[667px] sm:shadow-pcbox sm:overflow-hidden sm:m-auto flex-col items-center"'>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full"
      ></video>
      <canvas ref={canvasRef} className="absolute w-full h-full" />
      <div className="absolute top-0 left-0 p-4 text-orange-600 font-semibold text-xl">
        <h2>EyeAspectRatio: {eyeAspectRatio.toFixed(4)}</h2>
        <h2>MouthAspectRatio: {mouthAspectRatio.toFixed(4)}</h2>
        <p>张开嘴巴的次数: {mouthOpenCount.current}</p>
        <p>闭上眼睛的次数: {eyeCloseCount.current}</p>
        <p>睁开眼睛的次数: {eyeOpenCount.current}</p>
      </div>
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <LoadingSpinner size={60} className="  text-orange-600" />
        </div>
      )}
    </div>
  )
}
