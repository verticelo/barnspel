function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

new Vue({
  el: '#app',

  data: {
    showAttemptAnswer: true,
    showTeachWord: false,

    failedWord: null,
    failedLetters: [],
    failedLetterIndex: null,
    failedLetterIndexSecond: null,

    word: 'Loading',
    /*
    words: ['bil', 'fisk', 'sol', 'apa', 'gris', 'kanin', 'samuel', 'motocross', 'mamma', 'boll', 'fotboll', 'pojke', 'flicka', 'hem', 'cykel', 'och',
            'macka', 'öga', 'tröja', 'kalops', 'byxa', 'träna', 'buss', 'tak', 'mjölk', 'fot', 'joakim', 'morfar', 'farfar', 'mormor', 'farmor', 'lada', 'linnea', 'isak', 'tindra',
            'lina', 'matilda', 'sladd', 'köttfärssås', 'snor', 'element', 'trött', 'stor', 'laxsoppa', 'säng', 'ring', 'hoppa', 'elda', 'toalett', 'bus', 'spindel', 'orm',
          'kram', 'sylt', 'gröt', 'fattiga riddare', 'gräsmatta', 'bada', 'dusha', 'motorcykel', 'mobile command center', 'motor', 'mygga', 'kossa', 'flis', 'deborah', 'gabriel',
        'miriam', 'noomi', 'michael', 'daniel', 'gurka', 'lejon', 'tiger', 'elefant', 'äpple', 'kol', 'tomat',
        'golv', 'yxa', 'penna', 'panda', 'polis', 'eld'
          ]
    */
    words: []
  },

  mounted: async function () {
    await this.getWordlist()
    this.startWord()
  },

  methods: {

    getWordlist: async function () {
      return fetch('js/wordlist.txt').then(
        function (resp) { return resp.text(); }
      ).then((wordlist) => {
        this.words = wordlist.split(/[\n]+/)
      });
    },

    startWord: function () {
      this.word = this.nextWord()
      this.speakWord("Försök att läsa ordet", 1)
    },

    maybeUpperCaseWord: function (word) {
      if (Math.random() > 0.5) {
        word = word.toUpperCase()
      }
      return word
    },

    nextWord: function () {
      return this.words[Math.floor(Math.random()*this.words.length)]
    },

    attemptAnswer: function () {
      this.speakWord(this.word)
      this.showAttemptAnswer = false

      if (Math.random() > 0.8) {
        this.speakWord("Hade du rätt?", 1)
      }
    },

    answer: function (easy) {
      if (!easy) {
        this.showTeachWord = true
        this.teachWord(this.word)
        return
      }

      this.startPracticeRound()
    },

    startPracticeRound: function() {
      let next  = this.nextWord()
      //next      = this.maybeUpperCaseWord(next)
      this.word = next

      if (Math.random() > 0.8) {
        this.speakWord("Läs ordet", 1)
      }
      this.showAttemptAnswer = true
    },

    speakWord: async function (word, rate = 0.8, callback = null) {
      return new Promise(resolve => {
        var msg = new SpeechSynthesisUtterance();

        msg.volume = 1; // 0 to 1
        msg.rate = rate; // 0.1 to 10
        msg.pitch = 1.1; //0 to 2
        msg.text = word;
        msg.lang = 'sv-SE';

        msg.onerror = function(event) { console.log(event) }

        console.log("Speech started for word", word)

        msg.onend = () => {
          console.log("Speech ended for word", word)
          resolve()
        };

        speechSynthesis.speak(msg);
      })
    },

    teachWord: async function (word) {
      this.failedWord = word
      this.failedLetters = []

      for (var i = 0, len = word.length; i < len; i++) {
        this.failedLetters.push(word[i])
      }

      await this.teachIterateCharacters()
      console.log("next")
      await sleep(400)
      //await this.teachIterate2Characters()
      await this.speakWord(this.word, 1)
      await sleep(1000)
      await this.speakWord("Nu fortsätter vi!", 1)
      this.showTeachWord = false
      this.startPracticeRound()
    },

    teachIterateCharacters: async function () {
        console.log("Starting teachIterateCharacters ")

        this.failedLetterIndex = 0

        for (let char of this.failedLetters) {
          console.log("Starting character", char)
          await this.speakWord(char.toLowerCase(), 1)
          await sleep(300)
          this.failedLetterIndex++
        }

        this.failedLetterIndex = null
    },

    teachIterate2Characters: async function () {
        console.log("Starting double index")

        let index = 0

        while (this.failedLetters.length > index) {
          console.log("Running for index", index)
          this.failedLetterIndexSecond = null
          this.failedLetterIndex = index

          let firstLetter  = this.failedLetters[index]
          let secondletter = ''

          if (index + 1 < this.failedLetters.length) {
            this.failedLetterIndexSecond = index + 1
            secondletter = this.failedLetters[this.failedLetterIndexSecond]
          }

          let word = firstLetter + secondletter

          console.log("built word", word)

          await this.speakWord(word.toLowerCase(), 1)
          await sleep(200)

          this.failedLetterIndex = this.failedLetterIndex + 2
          index = index + 2
        }
        this.failedLetterIndex = null

    },
  }
})
