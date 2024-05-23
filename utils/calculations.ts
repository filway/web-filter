import { NormalizedLandmark } from '@mediapipe/tasks-vision'

// 计算两点间的距离
export function calculateDistance(
  point1: NormalizedLandmark,
  point2: NormalizedLandmark
) {
  const dx = point1.x - point2.x
  const dy = point1.y - point2.y
  return Math.sqrt(dx * dx + dy * dy)
}

// 计算四点的纵横比
export function get4PointsAspectRatio(points: NormalizedLandmark[]) {
  const v1 = calculateDistance(points[0], points[4])
  const h1 = calculateDistance(points[1], points[5])
  const h2 = calculateDistance(points[2], points[6])
  const h3 = calculateDistance(points[3], points[7])
  return (h1 + h2 + h3) / (3 * v1)
}

// 计算眼睛纵横比（EAR）
export function calculateEyeAspectRatio(landmarks: NormalizedLandmark[]) {
  const leftEyePoints = [
    landmarks[263],
    landmarks[385],
    landmarks[386],
    landmarks[387],
    landmarks[362],
    landmarks[380],
    landmarks[374],
    landmarks[373],
  ]
  const rightEyePoints = [
    landmarks[33],
    landmarks[160],
    landmarks[159],
    landmarks[158],
    landmarks[133],
    landmarks[144],
    landmarks[145],
    landmarks[153],
  ]
  const leftEAR = get4PointsAspectRatio(leftEyePoints)
  const rightEAR = get4PointsAspectRatio(rightEyePoints)
  return (leftEAR + rightEAR) / 2
}

// 计算嘴巴纵横比（MAR）
export function calculateMouthAspectRatio(landmarks: NormalizedLandmark[]) {
  const mouthPoints = [
    landmarks[61],
    landmarks[81],
    landmarks[13],
    landmarks[311],
    landmarks[291],
    landmarks[178],
    landmarks[14],
    landmarks[402],
  ]
  return get4PointsAspectRatio(mouthPoints)
}

// 获取5个点的位置
export function getPoint5(landmarks: NormalizedLandmark[]) {
  return [
    landmarks[468],
    landmarks[473],
    landmarks[4],
    landmarks[61],
    landmarks[291],
  ]
}

// 计算5个点的角度
export function getPoint5Angle(points: NormalizedLandmark[]) {
  const LMx = points.map((p: NormalizedLandmark) => p.x)
  const LMy = points.map((p: NormalizedLandmark) => p.y)

  const dPx_eyes = Math.max(LMx[1] - LMx[0], 1.0)
  const dPy_eyes = LMy[1] - LMy[0]
  const angle = Math.atan(dPy_eyes / dPx_eyes)

  const alpha = Math.cos(angle)
  const beta = Math.sin(angle)

  const LMRx = points.map(
    (p: NormalizedLandmark, index: number) =>
      alpha * p.x +
      beta * p.y +
      ((1 - alpha) * LMx[2]) / 2 -
      (beta * LMy[2]) / 2
  )
  const LMRy = points.map(
    (p: NormalizedLandmark, index: number) =>
      -beta * p.x +
      alpha * p.y +
      (beta * LMx[2]) / 2 +
      ((1 - alpha) * LMy[2]) / 2
  )

  const dXtot = (LMRx[1] - LMRx[0] + LMRx[4] - LMRx[3]) / 2
  const dYtot = (LMRy[3] - LMRy[0] + LMRy[4] - LMRy[1]) / 2

  const dXnose = (LMRx[1] - LMRx[2] + LMRx[4] - LMRx[2]) / 2
  const dYnose = (LMRy[3] - LMRy[2] + LMRy[4] - LMRy[2]) / 2

  const Xfrontal = dXtot !== 0 ? -90 + ((90 / 0.5) * dXnose) / dXtot : 0
  const Yfrontal = dYtot !== 0 ? -90 + ((90 / 0.5) * dYnose) / dYtot : 0

  const roll = (angle * 180) / Math.PI
  const pitch = Yfrontal
  const yaw = Xfrontal

  return [roll, pitch, yaw]
}
