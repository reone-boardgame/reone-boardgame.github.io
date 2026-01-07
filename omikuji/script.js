document.addEventListener("DOMContentLoaded", function() {
    const drawButton = document.getElementById('drawButton');
    const closeButton = document.getElementById('closeButton');
    const startScreen = document.getElementById('startScreen');
    const resultScreen = document.getElementById('resultScreen');
    const omikujiResult = document.getElementById('omikujiResult');

    // おみくじの結果リスト
    const fortunes = ['大吉', '中吉', '小吉', '吉'];

    // おみくじを引く処理
    drawButton.addEventListener('click', function() {
        const randomIndex = Math.floor(Math.random() * fortunes.length);
        const result = fortunes[randomIndex];

        omikujiResult.textContent = result;
        
        // 画面切り替え
        startScreen.style.display = 'none';
        resultScreen.style.display = 'block';
    });

    // ホームに戻る処理（親ウィンドウのモーダルを閉じる）
    closeButton.addEventListener('click', function() {
        window.parent.postMessage('closeGameModal', '*');
    });
});