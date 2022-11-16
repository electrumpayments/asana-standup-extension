console.log('Asana Standup Extension (ASE) is prepping to load');

function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function mkImg(relPath){
    const innerImg = document.createElement('img');
    innerImg.setAttribute('src', chrome.runtime.getURL(relPath));
    innerImg.setAttribute('width', '14px');
    innerImg.setAttribute('height', '14px');
    innerImg.setAttribute('aria-hidden', 'true');
    return innerImg;
}

//let toolbarRight = null;
let standupToolbar = null;
let standupBtn = null;
let timerElement = null;
let restartBtn = null;
let stopBtn = null;
let timerInterval = null;

function onRestartClick(){
    console.log('ASE: Restarting timer');
    clearInterval(timerInterval);
    timerElement.innerText = "00:59";
    timerInterval = setInterval(everySecond, 1000);
}

function onStopClick(){
    console.log('ASE: Stopping timer');
    clearInterval(timerInterval);
    $(timerElement).hide();
    $(restartBtn).hide();
    $(stopBtn).hide();
    $(standupBtn).show();
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
  if (!timerElement){
    timerElement = document.createElement('p');
    $(standupToolbar).append(timerElement);
  }else{
    $(timerElement).show();
  }
  timerElement.innerText = "00:59";

  if (!restartBtn){
    restartBtn = document.createElement('button');
    restartBtn.append(mkImg('lib/fontawesome-free-5.15.4-web/svgs/solid/undo.svg'));
    restartBtn.style['marginLeft'] = '4px';
    $(restartBtn).click(onRestartClick);
    $(standupToolbar).append(restartBtn);
  }else{
    $(restartBtn).show();
  }

  if (!stopBtn){
    stopBtn = document.createElement('button');
    stopBtn.append(mkImg('lib/fontawesome-free-5.15.4-web/svgs/solid/stop.svg'));
    stopBtn.style['marginLeft'] = '4px';
    $(stopBtn).click(onStopClick);
    $(standupToolbar).append(stopBtn);
  }else{
    $(stopBtn).show();
  }

  timerInterval = setInterval(everySecond, 1000);
}

// This function is repeated on the reg
function monitorToolbar(){

    const toolbarSelector = "#asana_main_page > div.ProjectPage > div.ProjectPage-board > div > div > div > div.FullWidthPageStructureWithDetailsOverlay-mainContent > div.Board > div.PageToolbarStructure.PageToolbarStructure--medium.ProjectBoardPageToolbar.Board-pageToolbar > div.PageToolbarStructure-rightChildren";
    let toolbarRight = document.querySelector(toolbarSelector);
    if (!toolbarRight){
        console.log("ASE: Failed to find Asana toolbar. Trying again...");
        return;
    }

    if (!standupToolbar){
        console.log('ASE: Creating standupToolbar');
        standupToolbar = document.createElement('div');
        standupToolbar.id = "ASE_Toolbar";
        standupToolbar.style['display'] = 'inline-flex';
        standupBtn = document.createElement('button');
        {
            const innerSpan = document.createElement('span');
            innerSpan.innerText = "Standup";
            const innerStartImg = mkImg('lib/fontawesome-free-5.15.4-web/svgs/solid/play.svg');
            innerStartImg.style['marginLeft'] = '4px';
            $(standupBtn).append(innerSpan);
            $(standupBtn).append(innerStartImg);
        }
        $(standupBtn).click(startStandup);
        $(standupToolbar).append(standupBtn);
    }
    // add ASE_Toolbar if not present
    let aseToolbarFound = false;
    for (const child of toolbarRight.children){
        if (child.id === "ASE_Toolbar"){
            aseToolbarFound = true;
            break;
        }
    }
    if (!aseToolbarFound){
        console.log('ASE: Adding standupToolbar to main toolbar');
        $(toolbarRight).prepend(standupToolbar);
    }
}

$(document).ready(() => setInterval(monitorToolbar, 1000));
