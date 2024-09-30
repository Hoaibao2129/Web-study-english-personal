let listWords = [] ;
let optionInputs = 0;
let currentWordIndex = 0;

function convertTextToData(text) {
    const lines = text.trim().split('\n');
    return lines.map(line => {
        const [english,vietnamese] = line.split(' : ').map(item => item.trim());
        return {english :english, vietnamese: vietnamese};
    });
}
function displayWords() {
    const input = document.getElementById("wordList").value;

    if (input.length > 0) {
        const convertData = convertTextToData(input);    
        listWords = shuffleArray(convertData);
    
        // Hide the input , text and submit button
        document.querySelector("h1.text-center").style.display = "none";
        document.getElementById("wordList").style.display = "none";
        document.querySelector("button.btn-primary").style.display = "none"; 
        
        // Show the start button
        document.getElementById("startButton").style.display = "block";
    }else{
        alert("Please input your word list");
    }

}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startStudy() {
      // Hide the "Let's Start" button
      document.getElementById("startButton").style.display = "none";

      // Show the input fields for options
      document.getElementById("optionInputs").style.display = "block";
}

function getSelectedOption() {
    const selectedOption = document.getElementById("optionsSelect").value;
    if (!selectedOption) {
        alert('Please select an option');
    }else{
      optionInputs = selectedOption === "Option 1" ? 1 : 2;

        // Hide the option inputs
      document.getElementById("optionInputs").style.display = "none";

        // Show the new input and buttons
      document.getElementById("newInputDiv").style.display = "block";

      start()
    }
}

function start() {
    if (listWords.length > 0) {
        const wordInput = document.getElementById("wordInput");
        wordInput.value = optionInputs ===1 ? listWords[currentWordIndex].english : listWords[currentWordIndex].vietnamese
    }
}

function showNextWord(nextIndex) {
    if(!nextIndex) {
        let wordType = document.getElementById("wordType");
        let result = false;
        if(optionInputs === 1){
            result = wordType.value.toUpperCase().trim() === listWords[currentWordIndex].vietnamese.toUpperCase();
        }else{
            result = wordType.value.toUpperCase().trim() === listWords[currentWordIndex].english.toUpperCase();
        }
        if(result){
        document.getElementById("warningMessage").style.display = "none";
        wordType.value = "";
        currentWordIndex++;
        if (currentWordIndex < listWords.length) {
            const wordInput = document.getElementById("wordInput");
            wordInput.value = optionInputs === 1 ? listWords[currentWordIndex].english : listWords[currentWordIndex].vietnamese 
        }}else{
            document.getElementById("warningMessage").style.display = "block";
            document.getElementById("sub-btn-try-again").style.display = "block";
            document.getElementById("sub-btn-skip").style.display = "block";
            document.getElementById("nextWordBtn").style.display = "none";
        }
    }else{
        currentWordIndex++;
        if (currentWordIndex < listWords.length) {
            const wordInput = document.getElementById("wordInput");
            wordInput.value = optionInputs === 1 ? listWords[currentWordIndex].english : listWords[currentWordIndex].vietnamese 
        }
    }
    
}


function skip() {
    document.getElementById("sub-btn-try-again").style.display ="none";
    document.getElementById("sub-btn-skip").style.display = "none";
    document.getElementById("nextWordBtn").style.display = "block";
    document.getElementById("warningMessage").style.display = "none";
    let wordType = document.getElementById("wordType")
    wordType.value = "";
    showNextWord(true);
}

function tryAgain() {
    document.getElementById("sub-btn-try-again").style.display ="none";
    document.getElementById("sub-btn-skip").style.display = "none";
    document.getElementById("nextWordBtn").style.display = "block";
}

function handleEnterKey(elementId, callbackFunction) {
    const element = document.getElementById(elementId);

    element.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            showNextWord(false);
        }
    });
}


handleEnterKey('wordType');
