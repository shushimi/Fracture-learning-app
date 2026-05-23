document.addEventListener('DOMContentLoaded', () => {
    // 要素の取得
    const phase1 = document.getElementById('phase1');
    const phase2 = document.getElementById('phase2');
    const phase3 = document.getElementById('phase3');
    const categoryList = document.getElementById('category-list');
    const learningContent = document.getElementById('learning-content');
    const homeBtn = document.getElementById('home-btn');
    const imageModal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');

    let currentCategory = "";
    let quizQueue = [];
    let missedQuestions = [];

    // --- ① カテゴリ選択画面の生成 ---
    function init() {
        if (!window.courseData || Object.keys(window.courseData).length === 0) {
            categoryList.innerHTML = "<p>データが見つかりません。dataフォルダのファイルを読み込めているか確認してください。</p>";
            return;
        }

        Object.keys(window.courseData).forEach(key => {
            const btn = document.createElement('button');
            btn.className = "category-btn";
            btn.innerText = window.courseData[key].title;
            btn.onclick = () => startPhase2(key);
            categoryList.appendChild(btn);
        });
    }

    // --- ② フェーズ2：学習（穴埋め） ---
    function startPhase2(key) {
        currentCategory = key;
        const data = window.courseData[key];
        
        // [テキスト] を 穴埋め用のspanタグに変換
        const processedText = data.content.replace(/\[(.*?)\]/g, '<span class="cloze" onclick="reveal(this)">$1</span>');
        
        learningContent.innerHTML = processedText;
        showView(phase2);
        homeBtn.classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    // 穴埋めをタップした時の処理
    window.reveal = (el) => {
        el.classList.add('revealed');
    };

    // 画像タップで拡大
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('content-img')) {
            imageModal.style.display = "flex";
            modalImg.src = e.target.src;
        }
    });

    // モーダル閉じる
    document.querySelector('.close').onclick = () => imageModal.style.display = "none";
    imageModal.onclick = (e) => { if(e.target === imageModal) imageModal.style.display = "none"; };

    // --- ③ フェーズ3：確認問題 ---
    document.getElementById('go-to-quiz').onclick = () => {
        quizQueue = [...window.courseData[currentCategory].questions];
        missedQuestions = [];
        startQuiz();
    };

    function startQuiz() {
        showView(phase3);
        document.getElementById('quiz-result').classList.add('hidden');
        document.getElementById('quiz-container').classList.remove('hidden');
        nextQuestion();
    }

    function nextQuestion() {
        if (quizQueue.length === 0) {
            showResult();
            return;
        }

        const qData = quizQueue[0];
        document.getElementById('quiz-progress').innerText = `残り: ${quizQueue.length}問`;
        document.getElementById('quiz-question-text').innerText = qData.q;
        
        const optionsDiv = document.getElementById('quiz-options');
        optionsDiv.innerHTML = "";
        qData.a.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = "quiz-opt";
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(index);
            optionsDiv.appendChild(btn);
        });
    }

    function checkAnswer(idx) {
        const qData = quizQueue[0];
        if (idx === qData.correct) {
            alert("正解！");
            quizQueue.shift();
        } else {
            alert(`不正解！ 正解は「${qData.a[qData.correct]}」です。`);
            const missed = quizQueue.shift();
            missedQuestions.push(missed); // 間違えたリストに追加
        }
        nextQuestion();
    }

    function showResult() {
        document.getElementById('quiz-container').classList.add('hidden');
        const resultDiv = document.getElementById('quiz-result');
        resultDiv.classList.remove('hidden');
        
        const scoreText = document.getElementById('score-text');
        const retryBtn = document.getElementById('retry-mistakes-btn');

        if (missedQuestions.length > 0) {
            scoreText.innerText = `${missedQuestions.length}問の間違いがありました。解き直しますか？`;
            retryBtn.classList.remove('hidden');
        } else {
            scoreText.innerText = "全問正解！クリアです！";
            retryBtn.classList.add('hidden');
        }
    }

    // 間違えた問題のみ再挑戦
    document.getElementById('retry-mistakes-btn').onclick = () => {
        quizQueue = [...missedQuestions];
        missedQuestions = [];
        startQuiz();
    };

    // ホームに戻る
    document.getElementById('back-to-home-btn').onclick = () => {
        showView(phase1);
        homeBtn.classList.add('hidden');
    };

    homeBtn.onclick = () => {
        if(confirm("ホームに戻りますか？（学習記録は残りません）")) {
            showView(phase1);
            homeBtn.classList.add('hidden');
        }
    };

    // 画面切り替え補助関数
    function showView(view) {
        [phase1, phase2, phase3].forEach(v => v.classList.add('hidden'));
        view.classList.remove('hidden');
    }

    // 実行
    init();
});
