document.addEventListener("DOMContentLoaded", function(event) { 
  const phrases = [
    {phrase: "This is phrase 1", hint: "This is hint 1"},
    {phrase: "This is phrase 2", hint: "This is hint 2"},
    {phrase: "This is phrase 3", hint: "This is hint 3"},
    {phrase: "This is phrase 4", hint: "This is hint 4"},
    {phrase: "This is phrase 5", hint: "This is hint 5"},
    {phrase: "This is phrase 6", hint: "This is hint 6"},
    {phrase: "This is phrase 7", hint: "This is hint 7"},
    {phrase: "This is phrase 8", hint: "This is hint 8"}
  ];

  function letterTmpl (letter, classes = "") {
    return `<div class="letter ${classes}">${letter}</div>`
  }

  function normalize(letter) {
    return letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function isLetterOrDigit(letter) {
    return normalize(letter).match(/[a-z0-9]/i);
  }

  class Game {
    constructor(phrases, phraseNode, hintNode) {
      this.phraseNode = phraseNode;
      this.hintNode = hintNode;
      this.phrases = phrases.map(p => new Phrase(p.phrase, phraseNode));
      this.hints = phrases.map(p => p.hint);
      this.current = 0;
      this.currentLetter = null;
    }

    render() {
      this.currentPhrase().render()
      this.hintNode.innerHTML = `<p>${this.currentHint()}</p>`
    }

    currentPhrase() {
      return this.phrases[this.current];
    }

    currentHint() {
      return this.hints[this.current];
    }

    next() {
      this.current = Math.min(this.phrases.length - 1, this.current + 1);
      this.render()
    }

    previous() {
      this.current = Math.max(0, this.current - 1);
      this.render()
    }

    guess(letter) {
      if (!this.currentLetter && this.currentPhrase().guess(letter)) {
        this.currentLetter = letter;
      }
    }

    discover() {
      if (this.currentLetter) {
        this.currentPhrase().discover(this.currentLetter)
        this.currentLetter = null;
      }
    }

  }

  class Phrase {
    constructor(letters, node) {
      this.words = letters.split(" ");
      this.letterSet = new Set();
      letters.split("").map(this.normalize).forEach(l => this.letterSet.add(l));
      this.discovered = new Set();
      this.guessed = new Set();
      this.node = node;
    }

    normalize(letter) {
      return normalize(letter)
    }

    reset() {
      this.discovered = new Set()
      this.guessed = new Set()
      this.render()
    }

    renderWord(word) {
      const letters = word.split("");
      return `<div class="word">${letters.map(this.renderLetter.bind(this)).join("")}</div>`
    }

    renderLetter(letter) {
      var classes = "";
      var letterToRender = letter;
      if (isLetterOrDigit(letter)) {
        var letterToRender = "_";
        var normalized = this.normalize(letter);

        if (this.guessed.has(normalized)) {
          classes += "guessed";
        }
        if (this.discovered.has(normalized)) {
          letterToRender = letter;
        }
      } else {
      }
      return `<div class="letter ${classes}">${letterToRender}</div>`;
    }

    render() {
      this.node.innerHTML = this.words.map(this.renderWord.bind(this)).join("")
    }

    guess(letter) {
      if (this.letterSet.has(this.normalize(letter))) {
        this.guessed.add(this.normalize(letter));
        this.render();
        return true;
      }
      return false;
    }

    discover(letter) {
      const normalized = this.normalize(letter);
      if (!this.guessed.has(normalized)) {
        return false;
      }
      this.discovered.add(normalized);
      this.render();
    }
  }

  window.GAME = new Game(
    phrases,
    document.querySelector("#root .phrase"),
    document.querySelector("#root .hint"),
  );
  GAME.render()

  document.addEventListener("keydown", function(e) {
    switch(e.key) {
      case "ArrowLeft":
        GAME.previous();
        break;
      case "ArrowRight":
        GAME.next();
        break;
      case "Enter":
        GAME.discover();
        break;
      default: 
        var letter = normalize(String.fromCharCode(e.which))
        GAME.guess(letter);
    }
  }, false);
});