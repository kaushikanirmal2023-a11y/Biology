// Quiz Logic JavaScript File - Complete Version with All Sections
// Total Questions: 654 (Section 1: 150, Section 2: 235, Section 3: 80, Section 4: 189)
// UPDATED: Question Tracking - No repeats across rounds

let currentSection = null;
let currentQuestionIndex = 0;
let currentRound = 1;
let correctAnswersInRound = 0;
let allQuestions = [];
let questionsForRound = [];
let userAnswers = [];
let answered = false;
let isRandomMode = false;
let usedQuestionIndices = []; // Track used questions to prevent repeats

// Question Banks - All 4 Sections
const questionBanks = {
    1: [], // Section 1: Molecular & Cell Biology (150 questions)
    2: [], // Section 2: Cell Cycle & Genetics (235 questions)
    3: [], // Section 3: Comparative Anatomy (80 questions)
    4: []  // Section 4: Parasitology & Disease (189 questions)
};

// Track loaded status
let questionsLoaded = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllQuestionBanks();
});

// Load all question banks from their respective files
async function loadAllQuestionBanks() {
    try {
        console.log('🚀 Starting to load all 4 question banks (Total: 654 questions)...');

        // ===== SECTION 1: Load from quiz1.json (Molecular & Cell Biology - 150 questions) =====
        try {
            const response1 = await fetch('quiz1.json');
            if (!response1.ok) throw new Error(`HTTP error! status: ${response1.status}`);
            
            const data1 = await response1.json();
            questionBanks[1] = Array.isArray(data1) ? data1 : [];
            console.log(`✓ Section 1 (Molecular & Cell Biology): ${questionBanks[1].length} questions loaded`);
        } catch (err) {
            console.error('❌ Error loading quiz1.json:', err);
            questionBanks[1] = [];
        }

        // ===== SECTION 2: Load from quiz2.json (Cell Cycle & Genetics - 235 questions) =====
        try {
            const response2 = await fetch('quiz2.json');
            if (!response2.ok) throw new Error(`HTTP error! status: ${response2.status}`);
            
            const data2 = await response2.json();
            questionBanks[2] = Array.isArray(data2) ? data2 : [];
            console.log(`✓ Section 2 (Cell Cycle & Genetics): ${questionBanks[2].length} questions loaded`);
        } catch (err) {
            console.error('❌ Error loading quiz2.json:', err);
            questionBanks[2] = [];
        }

        // ===== SECTION 3: Load from quiz3.json (Comparative Anatomy - 80 questions) =====
        try {
            const response3 = await fetch('quiz3.json');
            if (!response3.ok) throw new Error(`HTTP error! status: ${response3.status}`);
            
            const data3 = await response3.json();
            questionBanks[3] = Array.isArray(data3) ? data3 : [];
            console.log(`✓ Section 3 (Comparative Anatomy): ${questionBanks[3].length} questions loaded`);
        } catch (err) {
            console.error('❌ Error loading quiz3.json:', err);
            questionBanks[3] = [];
        }

        // ===== SECTION 4: Load from quiz4.json (Parasitology & Disease - 189 questions) =====
        try {
            const response4 = await fetch('quiz4.json');
            if (!response4.ok) throw new Error(`HTTP error! status: ${response4.status}`);
            
            const data4 = await response4.json();
            questionBanks[4] = Array.isArray(data4) ? data4 : [];
            console.log(`✓ Section 4 (Parasitology & Disease): ${questionBanks[4].length} questions loaded`);
        } catch (err) {
            console.error('❌ Error loading quiz4.json:', err);
            questionBanks[4] = [];
        }

        // Calculate total questions
        const totalQuestions = Object.values(questionBanks).reduce((sum, section) => sum + section.length, 0);
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL QUESTION BANKS LOADED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log(`📊 Total Questions: ${totalQuestions}`);
        console.log(`   • Section 1 (Molecular & Cell Biology): ${questionBanks[1].length} questions`);
        console.log(`   • Section 2 (Cell Cycle & Genetics): ${questionBanks[2].length} questions`);
        console.log(`   • Section 3 (Comparative Anatomy): ${questionBanks[3].length} questions`);
        console.log(`   • Section 4 (Parasitology & Disease): ${questionBanks[4].length} questions`);
        console.log('='.repeat(60) + '\n');

        questionsLoaded = true;

        if (totalQuestions === 0) {
            console.warn('⚠️ No questions loaded! Using fallback sample questions...');
            loadSampleQuestions();
        }

    } catch (error) {
        console.error('🔴 Critical error loading question banks:', error);
        loadSampleQuestions();
    }
}

// Load sample questions as fallback
function loadSampleQuestions() {
    console.log('📌 Loading sample questions as fallback...');
    
    questionBanks[1] = [
        { q: "What is the major component of DNA?", o: ["histones", "deoxyribonucleotides", "proteins", "amino acids"], a: 1 },
        { q: "Purine nitrogenous bases are:", o: ["A + T", "C + T", "A + G", "G + T"], a: 2 }
    ];

    questionBanks[2] = [
        { question: "What is the structural and functional unit of all living organisms?", options: {"a": "Tissue", "b": "Cell", "c": "Organ"}, correct_answer: "b" }
    ];

    questionBanks[3] = [
        { question: "What is the genetic characteristic of a population?", options: {"a": "sex ratio", "b": "gene pool"}, correct_answer: "b" }
    ];

    questionBanks[4] = [
        { question: "What parasite causes dysentery?", options: {"a": "Entamoeba histolytica", "b": "Balantidium coli"}, correct_answer: "a" }
    ];

    console.log('✓ Sample questions loaded as fallback');
}

// Normalize question format to handle both quiz1.json and quiz2-4.json formats
function normalizeQuestion(question) {
    return {
        q: question.q || question.question || '',
        o: question.o || (question.options ? Object.values(question.options) : []),
        a: typeof question.a === 'number' 
            ? question.a 
            : (typeof question.correct_answer === 'string' 
                ? question.correct_answer.charCodeAt(0) - 'a'.charCodeAt(0) 
                : 0)
    };
}

// Start Quiz
function startQuiz(section, randomMode = false) {
    currentSection = section;
    currentQuestionIndex = 0;
    currentRound = 1;
    correctAnswersInRound = 0;
    userAnswers = [];
    answered = false;
    isRandomMode = randomMode;
    usedQuestionIndices = []; // Reset used questions for new quiz

    // Get questions from the selected section
    allQuestions = questionBanks[section] || [];

    if (allQuestions.length === 0) {
        alert(`No questions available for this section. Please refresh the page.`);
        return;
    }

    console.log(`\n🎯 Starting Quiz - Section ${section}`);
    console.log(`   Available questions: ${allQuestions.length}`);
    console.log(`   Mode: ${randomMode ? '🔀 RANDOM' : '📋 ORDERED'}`);
    console.log(`   Selecting 10 questions for Round 1...\n`);

    selectQuestions(10, randomMode);

    // Update UI
    document.getElementById('sectionsView').style.display = 'none';
    document.getElementById('quizView').classList.add('show');
    document.getElementById('resultsView').classList.remove('show');
    document.querySelector('.back-button').classList.add('show');

    // Set section title and mode badge
    const titles = {
        1: 'Molecular & Cell Biology',
        2: 'Cell Cycle & Genetics',
        3: 'Comparative Anatomy',
        4: 'Parasitology & Disease'
    };
    
    document.getElementById('sectionTitle').textContent = titles[section];
    document.getElementById('modeBadge').textContent = randomMode ? '🔀 Random Mix' : '📋 Ordered';
    document.getElementById('totalQuestions').textContent = '10';

    loadQuestion();
}

// Select questions - ORDERED or RANDOM (with no repeats across rounds)
function selectQuestions(count, randomMode) {
    questionsForRound = [];
    
    if (allQuestions.length === 0) {
        console.error('❌ No questions available in this section');
        return;
    }

    if (randomMode) {
        // RANDOM MODE: Select random questions not yet used
        const availableIndices = [];
        for (let i = 0; i < allQuestions.length; i++) {
            if (!usedQuestionIndices.includes(i)) {
                availableIndices.push(i);
            }
        }

        // Shuffle available indices
        availableIndices.sort(() => Math.random() - 0.5);

        // Select questions
        const selectedIndices = availableIndices.slice(0, Math.min(count, availableIndices.length));
        questionsForRound = selectedIndices.map(idx => allQuestions[idx]);
        usedQuestionIndices.push(...selectedIndices);

        console.log(`🔀 Random Mode: Selected ${questionsForRound.length} questions`);
        console.log(`   Total used so far: ${usedQuestionIndices.length} / ${allQuestions.length}`);
    } else {
        // ORDERED MODE: Select next 10 questions sequentially (never used before)
        const startIndex = usedQuestionIndices.length;
        const endIndex = Math.min(startIndex + count, allQuestions.length);

        for (let i = startIndex; i < endIndex; i++) {
            questionsForRound.push(allQuestions[i]);
            usedQuestionIndices.push(i);
        }

        console.log(`📋 Ordered Mode: Selected questions ${startIndex + 1} to ${endIndex}`);
        console.log(`   Total used so far: ${usedQuestionIndices.length} / ${allQuestions.length}`);
    }

    if (questionsForRound.length === 0) {
        console.warn('⚠️ No more questions available in this section!');
    }
}

// Load current question
function loadQuestion() {
    if (currentQuestionIndex >= questionsForRound.length) {
        showResults();
        return;
    }

    const rawQuestion = questionsForRound[currentQuestionIndex];
    const question = normalizeQuestion(rawQuestion);
    answered = false;

    // Update progress
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('qNumber').textContent = currentQuestionIndex + 1;
    const progressPercent = ((currentQuestionIndex + 1) / questionsForRound.length) * 100;
    document.getElementById('progressFill').style.width = progressPercent + '%';

    // Load question text
    let questionText = question.q;
    if (questionText.includes('[...]')) {
        questionText = questionText.replace(/\s*\[\.\.\.\]\s*$/g, '');
    }
    document.getElementById('questionText').textContent = questionText;

    // Load options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    const options = question.o;
    const correctAnswerIndex = question.a;

    if (Array.isArray(options)) {
        options.forEach((option, index) => {
            const btn = createOptionButton(option, index, correctAnswerIndex);
            optionsContainer.appendChild(btn);
        });
    }

    // Reset feedback
    document.getElementById('answerFeedback').classList.remove('show');
    document.getElementById('nextBtn').disabled = true;
}

// Create option button
function createOptionButton(text, index, correctIndex) {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = text || 'Option';
    btn.onclick = () => selectOption(index, correctIndex, btn);
    btn.dataset.index = index;
    return btn;
}

// Select option and show feedback
function selectOption(selectedIndex, correctIndex, buttonElement) {
    if (answered) return;

    answered = true;
    const isCorrect = selectedIndex === correctIndex;

    userAnswers.push({
        question: questionsForRound[currentQuestionIndex],
        selected: selectedIndex,
        correct: correctIndex,
        isCorrect: isCorrect
    });

    if (isCorrect) {
        correctAnswersInRound++;
    }

    // Disable all options and show correct/incorrect
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('disabled');

        if (parseInt(btn.dataset.index) === correctIndex) {
            btn.classList.add('correct');
        } else if (parseInt(btn.dataset.index) === selectedIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    showFeedback(isCorrect, correctIndex);
    document.getElementById('nextBtn').disabled = false;
}

// Show feedback message
function showFeedback(isCorrect, correctIndex) {
    const feedback = document.getElementById('answerFeedback');
    const icon = document.getElementById('feedbackIcon');
    const text = document.getElementById('feedbackText');

    if (isCorrect) {
        feedback.classList.remove('incorrect');
        feedback.classList.add('correct', 'show');
        icon.textContent = '✓';
        text.textContent = 'Correct Answer! Well done! 🎯';
    } else {
        feedback.classList.remove('correct');
        feedback.classList.add('incorrect', 'show');
        icon.textContent = '✗';
        text.textContent = 'Incorrect! ';
        
        const question = normalizeQuestion(questionsForRound[currentQuestionIndex]);
        const options = question.o;
        
        if (Array.isArray(options) && options[correctIndex]) {
            text.textContent += `The correct answer is: "${options[correctIndex]}"`;
        }
    }
}

// Next question
function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// Show results
function showResults() {
    const percentage = Math.round((correctAnswersInRound / questionsForRound.length) * 100);
    const passed = correctAnswersInRound >= 5; // Pass with 50% (5/10)

    document.getElementById('quizView').classList.remove('show');
    document.getElementById('resultsView').classList.add('show');

    document.getElementById('scoreDisplay').textContent = `${correctAnswersInRound}/10`;
    document.getElementById('correctCount').textContent = correctAnswersInRound;
    document.getElementById('wrongCount').textContent = questionsForRound.length - correctAnswersInRound;
    document.getElementById('accuracy').textContent = percentage + '%';

    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.classList.remove('passed', 'failed');
    scoreDisplay.classList.add(passed ? 'passed' : 'failed');

    const message = document.getElementById('resultMessage');
    
    // Check if more questions are available
    const hasMoreQuestions = usedQuestionIndices.length < allQuestions.length;
    
    if (passed) {
        if (currentRound === 1 && hasMoreQuestions) {
            message.textContent = `Congratulations! You passed Round ${currentRound}! 🎉 Ready for Round 2? (Questions ${usedQuestionIndices.length + 1}-${Math.min(usedQuestionIndices.length + 10, allQuestions.length)})`;
        } else if (currentRound > 1 && hasMoreQuestions) {
            message.textContent = `Congratulations! You passed Round ${currentRound}! 🎉 Ready for Round ${currentRound + 1}? (Questions ${usedQuestionIndices.length + 1}-${Math.min(usedQuestionIndices.length + 10, allQuestions.length)})`;
        } else {
            message.textContent = `Congratulations! You've completed all available questions in this section! 🏆`;
        }
    } else {
        message.textContent = 'You need to score at least 5/10 to pass. Try again!';
    }

    const actionButtons = document.getElementById('actionButtons');
    actionButtons.innerHTML = '';

    if (passed && hasMoreQuestions) {
        const btnNext = document.createElement('button');
        btnNext.className = 'btn btn-primary';
        btnNext.textContent = `Continue to Round ${currentRound + 1} ➜`;
        btnNext.onclick = startNextRound;
        actionButtons.appendChild(btnNext);
    } else if (passed && !hasMoreQuestions) {
        const btnCongrats = document.createElement('button');
        btnCongrats.className = 'btn btn-primary';
        btnCongrats.textContent = 'All Questions Completed! 🏆';
        btnCongrats.onclick = goBack;
        actionButtons.appendChild(btnCongrats);
    }

    const btnRetry = document.createElement('button');
    btnRetry.className = 'btn btn-secondary';
    btnRetry.textContent = 'Try This Round Again';
    btnRetry.onclick = () => retryCurrentRound();
    actionButtons.appendChild(btnRetry);

    const btnHome = document.createElement('button');
    btnHome.className = 'btn btn-secondary';
    btnHome.textContent = '← Go to Home';
    btnHome.onclick = goBack;
    actionButtons.appendChild(btnHome);
}

// Start next round (with new questions)
function startNextRound() {
    currentRound++;
    correctAnswersInRound = 0;
    currentQuestionIndex = 0;
    userAnswers = [];
    answered = false;

    // Check if more questions are available
    if (usedQuestionIndices.length >= allQuestions.length) {
        alert('No more questions available in this section!');
        goBack();
        return;
    }

    selectQuestions(10, isRandomMode);

    if (questionsForRound.length === 0) {
        alert('No more questions available in this section!');
        goBack();
        return;
    }

    console.log(`\n🎯 Starting Round ${currentRound} - Section ${currentSection}\n`);

    document.getElementById('resultsView').classList.remove('show');
    document.getElementById('quizView').classList.add('show');

    loadQuestion();
}

// Retry current round (remove questions from tracking)
function retryCurrentRound() {
    // Remove the last 10 questions from used list to allow retry
    const questionsInCurrentRound = Math.min(10, questionsForRound.length);
    usedQuestionIndices.splice(-questionsInCurrentRound, questionsInCurrentRound);

    correctAnswersInRound = 0;
    currentQuestionIndex = 0;
    userAnswers = [];
    answered = false;

    selectQuestions(10, isRandomMode);

    console.log(`♻️ Retrying Round ${currentRound}\n`);

    document.getElementById('resultsView').classList.remove('show');
    document.getElementById('quizView').classList.add('show');

    loadQuestion();
}

// Go back to home
function goBack() {
    document.getElementById('sectionsView').style.display = 'grid';
    document.getElementById('quizView').classList.remove('show');
    document.getElementById('resultsView').classList.remove('show');
    document.querySelector('.back-button').classList.remove('show');

    currentSection = null;
    currentQuestionIndex = 0;
    currentRound = 1;
    correctAnswersInRound = 0;
    userAnswers = [];
    answered = false;
    isRandomMode = false;
    usedQuestionIndices = [];
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (document.getElementById('quizView').classList.contains('show')) {
        if (e.key === 'Enter' && !document.getElementById('nextBtn').disabled) {
            nextQuestion();
        }
    }
});

console.log('✅ Quiz Logic Module Loaded - Question Tracking Enabled!');
console.log('   • No questions will repeat across rounds');
console.log('   • Questions progress: 1-10, 11-20, 21-30, etc.');
console.log('   • Works with both ORDERED and RANDOM modes');
