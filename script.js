
var timer1    = null;
var deviceOn  = false;
var strictOn  = false;

var simon;
var timer2    = null;
var rate2     = 1000;
var delay2    = 1000;

function setDeviceOff() {
  deviceOn = false;
  strictOn = false;
  if (timer1) clearInterval(timer1);
  if (timer2) clearInterval(timer2);
  timer1 = null;
  timer2 = null;
  $(".btn-green").addClass("btn-green-off");
  $(".btn-red").addClass("btn-red-off");
  $(".btn-blue").addClass("btn-blue-off");
  $(".btn-yellow").addClass("btn-yellow-off");
  $(".counter").addClass("counter-off");
  $(".btn-strict-led").addClass("btn-strict-led-off");
  $(".btn-on").addClass("btn-on-off");
  $(".btn-off").addClass("btn-off-off");
}

function setDeviceOn() {
  deviceOn = true;
  timer1 = null;
  timer2 = null;
  $(".btn-green").removeClass("btn-green-off");
  $(".btn-red").removeClass("btn-red-off");
  $(".btn-blue").removeClass("btn-blue-off");
  $(".btn-yellow").removeClass("btn-yellow-off");
  $(".counter").removeClass("counter-off");
  $(".btn-on").removeClass("btn-on-off");
  $(".btn-off").removeClass("btn-off-off");
}

function buttonTimer() {
  timer1 = setTimeout(function() {
    $(".btn-big").removeClass("btn-green-on")
                 .removeClass("btn-red-on")
                 .removeClass("btn-yellow-on")
                 .removeClass("btn-blue-on");
    $(".btn-sml").removeClass("btn-start-on")
                 .removeClass("btn-strict-on");
    timer1 = null;
  }, 100);
}

function handleBigButton(id) {
  if (!deviceOn || timer1 !== null) {
    return;
  }
  $("#audio-" + id)[0].play();
  $(".btn-" + id).addClass("btn-" + id + "-on");
  buttonTimer();
}

function handleStartButton() {
  if (!deviceOn || timer1 !== null) {
    return;
  }

  // a second start is considered a re-start
  if (timer2) {
    clearInterval(timer2);
  }

  $(".btn-start").addClass("btn-start-on");
  buttonTimer();
  runGame();
}

function handleStrictButton(id) {
  if (!deviceOn || timer1 !== null) {
    return;
  }
  $(".btn-strict").addClass("btn-strict-on");
  strictOn = !strictOn;
  if (strictOn)
    $(".btn-strict-led").removeClass("btn-strict-led-off");
  else
    $(".btn-strict-led").addClass("btn-strict-led-off");
  buttonTimer();
}

$(document).ready(function() {
  setDeviceOff();

  simon = new Simon();

  $(".btn-green").click(function () {
    handleBigButton("green");
  });
  $(".btn-red").click(function () {
    handleBigButton("red");
  });
  $(".btn-yellow").click(function () {
    handleBigButton("yellow");
  });
  $(".btn-blue").click(function () {
    handleBigButton("blue");
  });
  $(".btn-start").click(function () {
    handleStartButton();
  });
  $(".btn-strict").click(function () {
    handleStrictButton();
  });
  $(".btn-off").click(function () {
    setDeviceOff();
  });
  $(".btn-on").click(function () {
    setDeviceOn();
  });

 });


function gameButton(num) {
  switch (num) {
    case simon.COLORGREEN:
      handleBigButton("green");
      break;
    case simon.COLORRED:
      handleBigButton("red");
      break;
    case simon.COLORBLUE:
      handleBigButton("blue");
      break;
    case simon.COLORYELLOW:
      handleBigButton("yellow");
      break;
  }
}

function gameTimer() {
  clearInterval(timer2);
  // set timer for playback/moves
  timer2 = setInterval(function() {
    var status = simon.status();
    console.log("status " + status);
    switch (status) {
      case simon.PLAYBACK:
        [move, newRate] = simon.next();
        console.log("playback");
        console.log(move);
        console.log(newRate);
        gameButton(move);
        if (newRate != this.rate2) {
          this.rate2 = newRate;
          gameTimer();
        }
        break;
      case simon.USERMOVES:
        //break;
      case simon.SEQFAIL:
        //break;
      case simon.SEQPASSED:
        //break;
      case simon.ALLPASSED:
        //break;
      default:
        console.log("stopping game timer");
        clearInterval(timer2);
        break;
                  }
    console.log("at rate " + this.rate2);
  }, this.rate2);
}

function runGame() {
  // start game with a delay
  timer2 = setTimeout(function() {
    // start game
    simon.start();
    // get first playback
    [move, this.rate2] = simon.next();
    console.log("start game");
    console.log(move);
    console.log(this.rate2);

    // process first playback
    gameButton(move);
    gameTimer();
  }, this.delay2);

}



class Simon {
  constructor() {
    this.COLORGREEN    = 1;
    this.COLORRED      = 2;
    this.COLORBLUE     = 3;
    this.COLORYELLOW   = 4;
    this.COLORSTART    = 1;
    this.COLORMAX      = 4;

    this.MAXSTEPS = 20;
    this.STEP1    = 0;
    this.RATE1    = 2000;
    this.STEP2    = 9;
    this.RATE2    = 1000;
    this.STEP3    = 15;
    this.RATE3    = 500;

    this.PLAYBACK   = 0;
    this.USERMOVES  = 1;
    this.SEQFAIL    = 2;
    this.SEQPASSED  = 3;
    this.ALLPASSED  = 4;
  }

  start() {
    this._sequence = [];
    this._rates    = [];
    var rate = 1000;
    for (var i=0; i<this.MAXSTEPS; i++) {
      // TODO: add random
      this._sequence[i] = (i%this.COLORMAX) + this.COLORSTART;
      if (i == this.STEP1) rate = this.RATE1;
      if (i == this.STEP2) rate = this.RATE2;
      if (i == this.STEP3) rate = this.RATE3;
      this._rates[i] = rate;
    }
    this._step   = 0;
    this._steps  = 19; //1;
    this._user   = 0;
    this._status = this.PLAYBACK;
  }

  next() {
    if (this._step >= this._steps)
      return -1;

    var rate   = this._rates[this._step];
    var result = this._sequence[this._step];
    this._step++;
    if (this._step >= this._steps) {
      this._status = this.USERMOVES;
    }
    return [result, rate];
  }

  move(color) {
    var rate = -1;
    if (this._move >= this._steps) {
      this._status = this.SEQPASSED;
      if (this._steps == this.MAXSTEPS) {
        this._status = this.ALLPASSED;
      }
    } else {
      if (color != this.sequence[this._move]) {
        this._status = this.SEQFAIL;
      } else {
        this._move++;
        rate = this._rates[this._move];
      }
    }
    return rate;
  }

  status() {
    return this._status;
  }
}
