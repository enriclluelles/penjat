document.addEventListener("DOMContentLoaded", function(event) { 
  const phrases2 = [
    {phrase: "------------ -- LLAMAD - AL --- --- BOMBERO ---- ------------", hint: "Hay un bug"},
    {phrase: "------------ -- NO - SE - RICK -- - PARECE - FALSO - ------------", hint: "No es verdad"},
    {phrase: "------------ -- ESCLAVOS - DE - - SU - DESORDEN -- ------------", hint: "Llegan tarde"},
    {phrase: "------------ --- NADIE - NOS -- ESTÁ - ESPERANDO ------------", hint: "Bernat y el mercado"},
    {phrase: "------------ --- BUAH - TIO --- -- QUE - BESTIA -- ------------", hint: "Dancarlo"},
    {phrase: "------------ -- EMOSIDO ----- ---- ENGAÑADO -- ------------", hint: "Faltaron a la verdad"},
    {phrase: "------------ -- YO - TENGO - UN - -- EFFERALGAN -- ------------", hint: "¿Alguien tiene un ibuprofeno?"}
  ];

  const phrases = [
    {phrase: "LLAMAD\nAL\nBOMBERO", hint: "Hay un bug"},
    {phrase: "NO SE RICK\nPARECE\nFALSO", hint: "No es verdad"},
    {phrase: "ESCLAVOS\nDE SU\nDESORDEN", hint: "Llegan tarde"},
    {phrase: "NADIE\nNOS ESTÁ\nESPERANDO", hint: "Bernat y el mercado"},
    {phrase: "BUAH TIO\nQUE BESTIA", hint: "Dancarlo"},
    {phrase: "EMOSIDO\nENGAÑADO", hint: "Faltaron a la verdad"},
    {phrase: "YO TENGO UN\nEFFERALGAN", hint: "¿Alguien tiene un ibuprofeno?"}
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
      this.lines = letters.split("\n");
      this.words = letters.split(' ');
      console.log(this.words)
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

    lineLengths() {
      return this.lines.map(l => l.length)
    }

    renderLine(line) {
      const words = line.split(" ")
      const joindiv = `<div class="fake-letter"></div>`
      return `<div class="line">${words.map(this.renderWord.bind(this)).join(joindiv)}</div>`
    }

    renderWord(word) {
      const letters = word.split("");
      return `<div class="word">${letters.map(this.renderLetter.bind(this)).join("")}</div>`
    }

    renderLetter(letter) {
      var classes = "";
      var letterToRender = letter;
      if (isLetterOrDigit(letter)) {
        var letterToRender = "";
        var normalized = this.normalize(letter);

        if (this.guessed.has(normalized)) {
          classes += "guessed ";
        }
        if (this.discovered.has(normalized)) {
          classes += "discovered "
          letterToRender = letter;
        }
      } else {
        var letterToRender = "";
        classes += "empty";
        var normalized = this.normalize(letter);
      }
      return `<div class="letter ${classes}">${letterToRender}</div>`;
    }

    render() {
      let fakeLines = this.lineLengths().map(l => {
        if (l % 2 == 0) {
          return 12
        }
        return 11
      }).map(l => {
        let content = `<div class="fake-line">`
        for (var i = 0; i < l; i++) {
          content = content + `<div class="fake-letter"></div>`
        }
        return content + `</div>`
      }).join("");
      let game =  this.lines.map(this.renderLine.bind(this)).join("");
      this.node.innerHTML = `<div class="fake-grid">` + fakeLines + `</div>` + game;
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
