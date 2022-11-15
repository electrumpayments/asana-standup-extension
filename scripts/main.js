console.log('Asana Standup Extension (ASE) is prepping to load');

function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

//let toolbarRight = null;
let standupToolbar = null;
let standupBtn = null;
let timerElement = null;
let timerInterval = null;

function onRestartClick(){
    console.log('ASE: Restarting timer');
    clearInterval(timerInterval);
    timerElement.innerText = "00:59";
    timerInterval = setInterval(everySecond, 1000);
}

function everySecond(){
    let secs = parseInt(timerElement.innerText.split(':')[1]);
    secs--;
    timerElement.innerText = "00:"+(secs < 10 ? '0'+secs : secs);

    if (secs === 0){
        clearInterval(timerInterval);
    }
}

function startStandup(){
  console.log('ASE: Starting standup');
  $(standupBtn).hide();
  timerElement = document.createElement('p');
  timerElement.innerText = "00:59";
  $(standupToolbar).append(timerElement);

  const restartBtn = document.createElement('button');
  const innerImg = document.createElement('img');
  innerImg.setAttribute('src', chrome.runtime.getURL('lib/fontawesome-free-5.15.4-web/svgs/solid/undo.svg'));
  innerImg.setAttribute('width', '14px');
  innerImg.setAttribute('height', '14px');
  innerImg.setAttribute('aria-hidden', 'true');
  restartBtn.append(innerImg);
  //restartBtn.innerHTML = '<i class="fa-regular fa-rotate-left"></i>'
  restartBtn.style['marginLeft'] = '4px';
  $(restartBtn).click(onRestartClick);
  $(standupToolbar).append(restartBtn);

  timerInterval = setInterval(everySecond, 1000);
}

async function setup(){

    const toolbarSelector = "#asana_main_page > div.ProjectPage > div.ProjectPage-board > div > div > div > div.FullWidthPageStructureWithDetailsOverlay-mainContent > div.Board > div.PageToolbarStructure.PageToolbarStructure--medium.ProjectBoardPageToolbar.Board-pageToolbar > div.PageToolbarStructure-rightChildren";
    let toolbarRight = document.querySelector(toolbarSelector);
    while (!toolbarRight){
        console.log("ASE: Failed to find toolbar. Trying again...");
        await delay(1000);
        toolbarRight = document.querySelector(toolbarSelector);
    }
    $(toolbarRight).on('DOMSubtreeModified', ()=>{
        $(toolbarRight).off('DOMSubtreeModified');
        setup();
    });

    console.log('ASE: Found toolbar. Setting up extension');

    if (!standupToolbar){
        console.log('ASE: Creating standupToolbar');
        standupToolbar = document.createElement('div');
        standupToolbar.id = "ASE_Toolbar";
        standupToolbar.style['display'] = 'inline-flex';
        standupBtn = document.createElement('button');
        standupBtn.innerText = "Start standup";
        standupBtn.onclick = startStandup;
        $(standupToolbar).append(standupBtn);
    }
    // add ASE_Toolbar if not present
    let aseToolbarFound = false;
    for (const child of toolbarRight.children){
        if (child.id === "ASE_Toolbar"){
            console.log("ASE: ASE_Toolbar present!");
            aseToolbarFound = true;
            break;
        }
    }
    if (!aseToolbarFound){
        console.log('ASE: Adding standupToolbar to main toolbar');
        $(toolbarRight).prepend(standupToolbar);
    }
}

//document.addEventListener("DOMContentLoaded", main);
$(document).ready(setup);
