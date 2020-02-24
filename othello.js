let Stone = {};

class Board{
  #rows = 8;
  #columns = 8;
  #square = [...Array(this.#rows)].map(() => Array(this.#columns).fill(Stone.BLANK.value));
  #dir = [[-1,0], [-1,1], [0,1], [1,1], [1,0], [1,-1], [0,-1], [-1,-1]];
  #turn;

  constructor(){ 
    this.init();
  }

  get rows(){
    return this.#rows;
  }

  get columns(){ 
    return this.#columns;
  }

  get data(){
    return this.#square;
  }

  init(){
    this.#turn = Stone.BLACK.value;
    this.setStone(3, 3, Stone.WHITE.value);
    this.setStone(3, 4, Stone.BLACK.value);
    this.setStone(4, 3, Stone.BLACK.value);
    this.setStone(4, 4, Stone.WHITE.value);
  }

  putStone(row, column, reverse){
    const dir = this.#dir,
          turn = this.#turn
          ;
    let _j,_row,_column;

    this.setStone(row, column, turn);
    for(let i=0; i<dir.length; i++){
      for(let j=0; reverse[i]>j; j++){
        _j = j + 1;
        _row = row + dir[i][0] * _j;
        _column = column + dir[i][1] * _j;
        this.setStone(_row, _column, turn);
      }
    }
  }

  setStone(row, column, color){
    this.#square[row][column] = color;
  }

  reverseCheck(row, column){
    const data = this.#square,
          dir = this.#dir,
          turn = this.#turn,
          columns = this.columns
          ;
    let reverse = [...Array(8).fill(0)],
        same = 0,
        _row,_column,_j,color
        ;

    if(data[row][column] !== 'BLANK') return reverse;
    for(let i=0; i<dir.length; i++){
      for(let j=0; j<columns; j++){
        _j = j + 1;
        _row = row + dir[i][0] * _j;
        _column = column + dir[i][1] * _j;

        if(_row < 0 || _row > 7 || _column < 0 || _column > 7) break;

        color = data[_row][_column];
        
        if(color === 'BLANK') break;
        if(color === turn){
          same = ~same;
          break;
        }
        reverse[i]++;
      }
      if(reverse[i] > 0 && ~same) reverse[i] = 0;
      if(same) same = ~same; 
    }
    return reverse;
  }

  checkTurn(){
    const data = this.#square,
          rows = this.#rows,
          columns = this.#columns
          ;
    let reverse,max;

    this.changeTurn();
    for(let i=0; i<rows; i++){
      for(let j=0; j<rows; j++){
        reverse = this.reverseCheck(i, j);
        max = Math.max.apply(null,reverse);
        if(data[i][j] !== 'BLANK') continue;
        if(max) break;
      }
      if(max) break;
    }
    if(!max) this.changeTurn();
  }

  changeTurn(){
    this.#turn = (this.#turn === 'BLACK') ? 'WHITE' : 'BLACK';
  }
}

class Stones{
  get value(){
    if(this === Stone.BLACK) return 'BLACK';
    if(this === Stone.WHITE) return 'WHITE';
    return 'BLANK';
  }
}

class Player{
  #board = new Board();
  
  constructor(){
    this.#board.init();
  }

  get boardData(){
    return this.#board.data;
  }

  get boardRows(){
    return this.#board.rows;
  }

  get boardColumns(){
    return this.#board.columns;
  }

  Click(elm){
    const row = elm.currentTarget.parentNode.rowIndex,
          column = elm.currentTarget.cellIndex,
          reverse = this.#board.reverseCheck(row, column)
          ;

    if(!Math.max.apply(null,reverse)) return;
    this.#board.putStone(row, column, reverse);
    this.#board.checkTurn();
  }
}

class viewBoard{
  #controller = new Player();
  #rows = this.#controller.boardRows;
  #columns = this.#controller.boardColumns;

  constructor(){
    this.latestData = JSON.parse(JSON.stringify(this.#controller.boardData));
    this.addBoard();
    this.addEvent();
    this.updateScreen();
  }

  $(id){
    return document.getElementById(id);
  }

  $C(elm_class){
    return document.getElementsByClassName(elm_class);
  }

  createElm(name, id, elm_class){
    let elm = document.createElement(name);
    
    if(id) elm.id = id;
    if(elm_class) elm.className = elm_class;
    return elm;
  }
  
  addBoard(){
    const d = document,
          db = d.body,
          df = d.createDocumentFragment(),
          $ = this.$
          ;
    let elm,tr,td;

    elm = this.createElm('div','othello_base');
    elm.style='position:absolute;top:100px;left:100px;cursor:move;';
    db.appendChild(elm);
    elm = this.createElm('div','othello_close');
    elm.innerHTML = '<p id="close">閉じる</p>';
    $('othello_base').appendChild(elm);
    elm = this.createElm('table','othello_board');
    $('othello_base').appendChild(elm);
    for(let i=0; i<this.#rows; i++){
      tr = this.createElm('tr');
      for (let j=0; j<this.#columns; j++){
        td = this.createElm('td','','square');
        tr.appendChild(td);
      }
      df.appendChild(tr);
    }
    $('othello_board').appendChild(df);
    elm = this.createElm('style','othello_board_style');
    db.appendChild(elm);
    $('othello_board_style').innerHTML = `
      #othello_base{
        width: 466px;
        height: 510px;
        background: #A9CEEC;
      }
      #othello_close{
        margin: 0 auto 20px auto;
        width: 60px;
        height: 20px;
        font-size: 20px !important;
        cursor: pointer;
      }
      #othello_board{
        margin: 10px auto;
        width: 436px;
        height: 240px;
        background: #396;
        border: #333 solid 10px;
        border-collapse: collapse;
      }
      #othello_board tr{
        margin: 0;
      }
      #othello_board tr td{
        float: left;
        width: 48px;
        height: 48px;
        border: #333 solid 1px;
        cursor: pointer;
      }
      .black,
      .white{
        position: relative;
      }
      .black::before,
      .white::before{
        content: "●";
        position: absolute;
        top: 0;
        left: 0;
        margin: -10px 0px 0px 0px;
        font-size :50px !important;
      }
      .black::before{
        color: #000;
      }
      .white::before{
        color: #FFF;
      }
    `;
  }

  addEvent(){
    const $ = this.$,
          base = $('othello_base'),
          close = $('close'),
          cell = this.$C('square'),
          square = 64
          ;
    let click = 0,
        x,y,_cell
        ;

    base.onmousedown = e => {
      x = e.clientX - ~~base.style.left.slice(0,-2);
      y = e.clientY - ~~base.style.top.slice(0,-2);
      click = ~click;
    }

    base.onmouseup = e => {
      click = ~click;
    }

    base.onmousemove = e => {
      if(click){
        base.style.left = ~~(e.clientX - x) + "px";
        base.style.top = ~~(e.clientY - y) + "px"; 
      }
    }

    close.onclick = e =>{
      base.style = 'display:none';
    }

    for(let i=0; i<square; i++){
      _cell = cell.item(i);
      _cell.addEventListener('click',this.#controller.Click.bind(this.#controller));
      _cell.addEventListener('click',this.checkData.bind(this));
    }
  }

  checkData(){
    if(JSON.stringify(this.latestData) === JSON.stringify(this.#controller.boardData)) return;
    this.latestData = JSON.parse(JSON.stringify(this.#controller.boardData));
    this.updateScreen();
  }

  updateScreen(){
    const $ = this.$;
    let color,target,_i,_j;

    for(let i=0; i<this.#rows; i++){
      for(let j=0; j<this.#columns; j++){
        color = this.latestData[i][j];
        target = $('othello_board').rows[i].cells[j];
        if(color === 'BLANK') continue;
        if(color === 'BLACK') target.className = 'square black';
        if(color === 'WHITE') target.className = 'square white';
      }
    }
  }
}

Stone = {
  BLACK : new Stones(),
  WHITE : new Stones(),
  BLANK : new Stones()
};

const othello = new viewBoard();