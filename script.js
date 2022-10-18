const tableBody = document.querySelector('.data');
const allDataItems = tableBody.querySelectorAll('.data-item');

// click event listening to the data items or TD
allDataItems.forEach((TDItem) => {
    let mainVal = TDItem.parentElement.querySelector('td:nth-child(3)').textContent; // total/main val

    TDItem.addEventListener('click', function(e){
        if(e.target.classList.contains('edit-btn') || e.target.classList.contains('edit-btn-ico')){
            // value should be set before the edit modal opens up
            if(TDItem.classList.contains('selected-td')){
                resetRecentlyClicked(TDItem.parentElement);
                TDItem.classList.add('selected-recent', 'editor-on');
                // remove edit modal from all 
                resetEditorModal(TDItem);
                TDItem.appendChild(createEditModal(TDItem));
                TDItem.querySelector('.edit-modal').classList.add('show-edit-modal');
                enableEditing(TDItem, mainVal);
            }
        } else {
            // selecting an item for the first time
            if(!TDItem.classList.contains('selected-td')){
                TDItem.classList.add("selected-td");
                resetRecentlyClicked(TDItem.parentElement);
                TDItem.classList.add('selected-recent');
    
                let editedTDCount = TDItem.parentElement.querySelectorAll('.edited-td').length;
                if(editedTDCount == 0){
                    let calcVal = findContainerValue(TDItem.parentElement, mainVal, "NOT_EDITED");
                    setContainerValueSingle(calcVal, TDItem);
                    setContainerValueOthers(TDItem.parentElement, calcVal);
                } else {
                    let tempEditedVal = 0;
                    TDItem.parentElement.querySelectorAll('.edited-td').forEach(tempTDItem => tempEditedVal += parseFloat(tempTDItem.querySelector('input').value));
                    let calcVal = findContainerValue(TDItem.parentElement, (mainVal - tempEditedVal), "EDITED");
                    setContainerValueSingle(calcVal, TDItem);
                    setContainerValueOthers(TDItem.parentElement, calcVal);
                }
            } else if((!TDItem.classList.contains('editor-on') && !TDItem.classList.contains('btn-click-on-action'))){
                // unselecting a data item
                TDItem.classList.remove('selected-td', 'edited-td');
                resetRecentlyClicked(TDItem.parentElement);
                TDItem.classList.add('selected-recent');
    
                let tempUnselectVal = parseFloat(TDItem.querySelector('input').value);
                unselectContainer(TDItem);

                let tempMainVal = 0;
                TDItem.parentElement.querySelectorAll('.selected-td').forEach(TDItem => tempMainVal += parseFloat(TDItem.querySelector('input').value));

                let editedTDCount = TDItem.parentElement.querySelectorAll('.edited-td').length;
                if(editedTDCount == 0){
                    let calcVal = findContainerValue(TDItem.parentElement, (tempMainVal + tempUnselectVal), "NOT_EDITED");
                    setContainerValueOthers(TDItem.parentElement, calcVal);
                } else {
                    let tempEditedVal = 0;
                    TDItem.parentElement.querySelectorAll('.edited-td').forEach(tempTDItem => tempEditedVal += parseFloat(tempTDItem.querySelector('.data-item-input').value));
                    let calcVal = findContainerValue(TDItem.parentElement, (mainVal - tempEditedVal), "EDITED");
                    setContainerValueOthers(TDItem.parentElement, calcVal);
                }
            } else if(TDItem.classList.contains('btn-click-on-action') && TDItem.querySelector('.data-item-value').textContent.length > 0){
                resetBtnClickOnAction(TDItem);
            }
        }
    });
});

// unselect the current td
const unselectContainer = (TDItem) => {
    TDItem.querySelector('.data-item-input').value = 0;
    TDItem.querySelector('.data-item-value').innerHTML = "";
}

// intial container value calculation
const findContainerValue = (parentTR, mainVal, type) => {
    if(type == 'NOT_EDITED'){
        let selectedTDCount = parentTR.querySelectorAll('.selected-td').length;
        // console.log(mainVal, selectedTDCount, "=>", mainVal/selectedTDCount);
        return mainVal / selectedTDCount;
    }
    if(type == "EDITED"){
        let selectedTDCountExceptEdited = parentTR.querySelectorAll('.selected-td').length - parentTR.querySelectorAll('.edited-td').length;
        // console.log(mainVal, selectedTDCountExceptEdited, "=>", mainVal / selectedTDCountExceptEdited);
        return mainVal / selectedTDCountExceptEdited;
    }

    // Output: Infinity => When main value is divided into 0 parts (Division by zero issue) | Works fine! as no any other items is selected at that point where value has to be set.
}

// setting the value for the current selection
const setContainerValueSingle = (calcVal, TDItem) => {
    if(TDItem.querySelectorAll('.data-item-input').length == 0){
        // data item input value
        const inputElem = document.createElement('input');
        inputElem.setAttribute('type', 'hidden');
        inputElem.setAttribute('value', calcVal);
        inputElem.classList.add('data-item-input');
        TDItem.appendChild(inputElem);
        
        // data item input value display
        const dataItemValueElem = document.createElement('span');
        dataItemValueElem.classList.add('data-item-value');
        dataItemValueElem.innerHTML = calcVal.toFixed(2);
        TDItem.appendChild(dataItemValueElem);
    } else {
        TDItem.querySelector('.data-item-input').value = calcVal;
        TDItem.querySelector('.data-item-value').innerHTML = calcVal.toFixed(2);
    }
}

// setting the value except the currently selected one (Note: previously selected and not modified manually)
const setContainerValueOthers = (parentTR, calcVal) => {
    parentTR.querySelectorAll('.selected-td').forEach(TDItem => {
        if(!TDItem.classList.contains('selected-recent') && !TDItem.classList.contains('edited-td')){
            TDItem.querySelector('input').value = calcVal;
            TDItem.querySelector('span').innerHTML = calcVal.toFixed(2);
        }
    })
}

// resetting the recent selection
const resetRecentlyClicked = (parentTR) => {
    parentTR.querySelectorAll('.data-item').forEach(TDItem => {
        if(TDItem.classList.contains('selected-recent')) TDItem.classList.remove('selected-recent');
    });
}

// enabling editing
const enableEditing = (TDItem, mainVal) => {
    // getting the current value data
    let prevVal = TDItem.querySelector('.data-item-input').value;
    const editModalBtn = TDItem.querySelector('.edit-modal-btn');

    editModalBtn.addEventListener('click', () => {
        resetBtnClickOnAction(TDItem);
        TDItem.classList.add('btn-click-on-action');
        let currentInput = TDItem.querySelector('.edit-modal-input');
        if(currentInput.value <= parseFloat(mainVal) && currentInput.value >= 0){
            TDItem.querySelector('.data-item-value').innerHTML = (parseFloat(currentInput.value)).toFixed(2);
            TDItem.querySelector('.data-item-input').value  = (parseFloat(currentInput.value));
            TDItem.classList.add('edited-td');
            TDItem.classList.add('selected-td');
            findNewValueForOthers(mainVal, prevVal, TDItem);
            TDItem.classList.remove('editor-on');
        } else {
            alert("Invalid user input");
            TDItem.querySelector('.data-item-value').innerHTML = (parseFloat(prevVal)).toFixed(2);
            TDItem.querySelector('.data-item-input').value = (parseFloat(prevVal));
        }
    });
}

const findNewValueForOthers = (mainVal, prevVal, TDItem) => {
    let tempVal = 0, tempCount = 0, tempMainVal = parseFloat(mainVal);
    TDItem.parentElement.querySelectorAll('.selected-td').forEach(TDItem => {
        if(TDItem.classList.contains('edited-td')) tempVal += parseFloat(TDItem.querySelector('.data-item-input').value);
        else tempCount++; 
    });

    tempMainVal -= tempVal;
    if(tempMainVal >= 0){
        let eqTempVal = tempMainVal / tempCount;
        // Output: NaN when both tempMainVal (when main value & edited value is equal) & tempCount (when no any value is edited prior to the recent edit) are 0
        TDItem.parentElement.querySelectorAll('.selected-td').forEach(TDItem => {
            if(!TDItem.classList.contains('edited-td')){
                TDItem.querySelector('.data-item-input').value = eqTempVal;
                TDItem.querySelector('.data-item-value').innerHTML = eqTempVal.toFixed(2);
            }
        });
    } else {
        alert("Insufficent Value Remained");
        TDItem.querySelector('.data-item-input').value = prevVal;
        TDItem.querySelector('.data-item-value').innerHTML = parseFloat(prevVal).toFixed(2);
    }
    TDItem.removeChild(TDItem.querySelector('.edit-modal'));
}

// creating edit modal dynamically
const createEditModal = (TDItem) => {
    let tempDataItemValue = TDItem.querySelector('.data-item-input').value;
    const editModalDiv = document.createElement('div');
    editModalDiv.classList.add('edit-modal', 'd-flex', 'flex-column');
    // setting input box for value edit
    const inputElem = document.createElement('input');
    inputElem.classList.add('edit-modal-input');
    // inputElem.setAttribute('value', tempDataItemValue);
    inputElem.setAttribute('value', 0);
    editModalDiv.appendChild(inputElem);
    
    // setting submit button
    const buttonElem = document.createElement('button');
    buttonElem.setAttribute('type', 'button');
    buttonElem.classList.add('edit-modal-btn', 'bg-primary', 'btn', 'btn-sm');
    buttonElem.textContent = "SET";
    editModalDiv.appendChild(buttonElem);

    // settin close button 
    const iconBtnElem = document.createElement('button');
    iconBtnElem.setAttribute('type', 'button');
    iconBtnElem.classList.add('edit-modal-close-btn');
    iconBtnElem.innerHTML = "<i class = 'fas fa-times edit-modal-close-btn-ico'></i>";
    editModalDiv.appendChild(iconBtnElem);
    return editModalDiv;
}

// reset all modal of the current row
const resetEditorModal = (TDItem) => {
    TDItem.parentElement.querySelectorAll('.selected-td').forEach(TDItemSingle => {
        if(TDItemSingle.querySelector('.edit-modal')){
            TDItemSingle.removeChild(TDItemSingle.querySelector('.edit-modal'));
            TDItemSingle.classList.remove('editor-on');
        }
    });
}

// remove modal when close button is clicked
window.addEventListener('click', (event) => {
    let targetedEditModal, targetedTDItem;
    if(event.target.classList.contains('edit-modal-close-btn-ico')){
        targetedEditModal = event.target.parentElement.parentElement;
        targetedTDItem = targetedEditModal.parentElement;
        targetedEditModal.parentElement.removeChild(targetedEditModal);
        targetedTDItem.classList.remove('editor-on');
    } else if(event.target.classList.contains('edit-modal-close-btn')){
        targetedEditModal = event.target.parentElement;
        targetedTDItem = targetedEditModal.parentElement;
        targetedEditModal.parentElement.removeChild(targetedEditModal);
        targetedTDItem.classList.remove('editor-on');
    }
});

const resetBtnClickOnAction = (TDItem) => {
    TDItem.parentElement.querySelectorAll('.btn-click-on-action').forEach(TDItemSingle => TDItemSingle.classList.remove('btn-click-on-action'));
}


