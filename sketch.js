// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY;
let circleRadius = 50; // 半徑為50，直徑為100
let isDragging = false; // 是否正在拖動圓
let previousX, previousY; // 儲存上一個圓心的位置

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);

  // 初始化圓的位置為視窗中間
  circleX = width / 2;
  circleY = height / 2;

  // 初始化上一個位置
  previousX = circleX;
  previousY = circleY;
}

function draw() {
  image(video, 0, 0);

  // 繪製圓
  fill(0, 0, 255);
  noStroke();
  circle(circleX, circleY, circleRadius * 2);

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    let isTouching = false; // 檢查是否有手指碰觸圓
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 繪製手部關鍵點
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 根據左右手設定顏色
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // 左手食指 (keypoint 8) 和大拇指 (keypoint 4) 同時碰觸圓時，讓圓跟隨手指移動
        if (hand.handedness == "Left") {
          let indexFinger = hand.keypoints[8];
          let thumb = hand.keypoints[4];

          // 計算食指與圓心的距離
          let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
          // 計算大拇指與圓心的距離
          let dThumb = dist(thumb.x, thumb.y, circleX, circleY);

          // 如果兩者都碰觸到圓的邊緣，移動圓
          if (dIndex < circleRadius && dThumb < circleRadius) {
            isTouching = true;
            isDragging = true;

            // 繪製紅色軌跡
            stroke(255, 0, 0); // 紅色線條
            strokeWeight(2);
            line(previousX, previousY, circleX, circleY);

            // 更新圓心位置
            previousX = circleX;
            previousY = circleX;
            circleX = (indexFinger.x + thumb.x) / 2; // 圓心移動到兩指的中間
            circleY = (indexFinger.y + thumb.y) / 2;
          }
        }

        // 左右手大拇指 (keypoint 4) 碰觸圓時，讓圓跟隨大拇指移動
        let thumb = hand.keypoints[4];
        let dThumb = dist(thumb.x, thumb.y, circleX, circleY);

        if (dThumb < circleRadius) {
          isTouching = true;
          isDragging = true;

          // 繪製綠色軌跡
          stroke(0, 255, 0); // 綠色線條
          strokeWeight(2);
          line(previousX, previousY, circleX, circleY);

          // 更新圓心位置
          previousX = circleX;
          previousY = circleY;
          circleX = thumb.x;
          circleY = thumb.y;
        }
      }
    }

    // 如果沒有手指碰觸圓，停止拖動
    if (!isTouching) {
      isDragging = false;
    }
  }
}
