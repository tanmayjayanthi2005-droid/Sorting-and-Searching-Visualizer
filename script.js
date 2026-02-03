let arr = [];
let isSorting = false;
let stepByStep = false;
let stepResolve;
let currentOperation = null;
let animationSpeed = 50; // Default speed (medium)

// DOM utility functions to reduce redundancy and improve safety
function getElement(id) {
    return document.getElementById(id);
}

function hideElement(id) {
    getElement(id).classList.add("hidden");
}

function showElement(id) {
    getElement(id).classList.remove("hidden");
}

function updateElementText(id, text) {
    const element = getElement(id);
    if (element) {
        element.textContent = text;
    }
}

function selectOperation(operation) {
    hideElement("operation-container");
    showElement(operation + "-container");
}

function stopAndReset() {
    // Stop current operation
    stopCurrentOperation();
    
    // Hide all containers except operation container
    hideElement("sorting-container");
    hideElement("searching-container");
    
    // Show operation container with animation
    const operationContainer = getElement("operation-container");
    operationContainer.classList.remove("hidden");
    operationContainer.classList.add("show");
    
    // Clear the array container
    const arrayContainer = document.querySelector('.array-container');
    if (arrayContainer) {
        arrayContainer.innerHTML = '';
    }
    
    // Reset status
    updateElementText("operation-status", '');
    
    // Hide next step button if visible
    hideElement("nextStep");
    
    // Update step toggle button text if needed
    if (stepByStep) {
        stepByStep = false;
        updateElementText("stepToggle", "Enable Step Mode");
    }
}

function generateArray(useInput) {
    const input = getElement("userInput").value;
    arr = useInput && input 
        ? input.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num)) 
        : Array.from({length: 10}, () => Math.floor(Math.random() * 100) + 1);
    
    renderArray();
    updateElementText("operation-status", "Array generated. Select an algorithm to begin.");
}

function generateSearchArray(useInput) {
    const input = getElement("searchInput").value;
    arr = useInput && input 
        ? input.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num)) 
        : Array.from({length: 10}, () => Math.floor(Math.random() * 100) + 1);
    
    // Sort array for binary search
    arr.sort((a, b) => a - b);
    renderArray();
    updateElementText("operation-status", "Sorted array generated. Select a search algorithm to begin.");
}

function renderArray(highlightIndices = []) {
    const container = document.querySelector('.array-container');
    if (!container) return; // Safety check
    
    // Store the existing partition info elements
    const partitionInfos = [];
    document.querySelectorAll('.partition-info').forEach(el => {
        partitionInfos.push({
            element: el,
            parentNode: el.parentNode
        });
        try {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        } catch (e) {
            console.log("Error removing partition info during render:", e);
        }
    });
    
    container.innerHTML = '';
    
    // Find max value for scaling
    const maxValue = Math.max(...arr, 1); // Ensure we don't divide by zero
    
    arr.forEach((value, index) => {
        let box = document.createElement('div');
        box.classList.add('box');
        box.textContent = value;
        box.dataset.index = index;
        
        // Make height relative to value
        const heightPercentage = (value / maxValue) * 100;
        box.style.height = `${Math.max(20, heightPercentage)}px`;
        
        if (highlightIndices.includes(index)) {
            box.classList.add('highlight');
        }
        container.appendChild(box);
    });
    
    // Re-add the partition info elements
    partitionInfos.forEach(info => {
        try {
            if (info.parentNode && info.element) {
                info.parentNode.appendChild(info.element);
            }
        } catch (e) {
            console.log("Error re-adding partition info after render:", e);
        }
    });
}

function renderArrayWithSubArrays(leftIndices = [], rightIndices = [], pivotIndex = null) {
    const container = document.querySelector('.array-container');
    if (!container) return; // Safety check
    
    // Store the existing partition info elements
    const partitionInfos = [];
    document.querySelectorAll('.partition-info').forEach(el => {
        partitionInfos.push({
            element: el,
            parentNode: el.parentNode
        });
        try {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        } catch (e) {
            console.log("Error removing partition info during render:", e);
        }
    });
    
    container.innerHTML = '';
    
    // Find max value for scaling
    const maxValue = Math.max(...arr, 1); // Ensure we don't divide by zero
    
    arr.forEach((value, index) => {
        let box = document.createElement('div');
        box.classList.add('box');
        box.textContent = value;
        box.dataset.index = index;
        
        // Make height relative to value
        const heightPercentage = (value / maxValue) * 100;
        box.style.height = `${Math.max(20, heightPercentage)}px`;
        
        // Add special classes for subarray visualization
        if (leftIndices.includes(index)) {
            box.classList.add('left-subarray');
        }
        if (rightIndices.includes(index)) {
            box.classList.add('right-subarray');
        }
        if (pivotIndex === index) {
            box.classList.add('pivot-element');
        }
        
        container.appendChild(box);
    });
    
    // Re-add the partition info elements
    partitionInfos.forEach(info => {
        try {
            if (info.parentNode && info.element) {
                info.parentNode.appendChild(info.element);
            }
        } catch (e) {
            console.log("Error re-adding partition info after render:", e);
        }
    });
}

function toggleStepByStep() {
    stepByStep = !stepByStep;
    const nextStepBtn = getElement("nextStep");
    
    if (stepByStep) {
        showElement("nextStep");
    } else {
        hideElement("nextStep");
    }
    
    // Update button text
    updateElementText("stepToggle", stepByStep ? "Disable Step Mode" : "Enable Step Mode");
}

function updateSpeed() {
    const slider = getElement("speedSlider");
    const rawValue = parseInt(slider.value);
    
    // Apply non-linear scaling for better speed control
    if (rawValue <= 20) {
        // Very slow - exponential scaling
        animationSpeed = Math.pow(rawValue/20, 2) * 20;
    } else if (rawValue <= 40) {
        // Slow - gentler curve
        animationSpeed = 20 + (rawValue - 20) * 1.5;
    } else {
        // Medium to very fast - linear
        animationSpeed = rawValue;
    }
    
    // Update the display value
    const speedValue = getElement("speedValue");
    let speedText;
    
    if (rawValue <= 20) {
        speedText = "Very Slow";
    } else if (rawValue <= 40) {
        speedText = "Slow";
    } else if (rawValue <= 60) {
        speedText = "Medium";
    } else if (rawValue <= 80) {
        speedText = "Fast";
    } else {
        speedText = "Very Fast";
    }
    
    updateElementText("speedValue", speedText);
}

async function waitForNextStep() {
    if (stepByStep) {
        return new Promise(resolve => stepResolve = resolve);
    } else {
        // Calculate delay based on speed setting (invert so higher value = faster)
        const delay = 500 - (animationSpeed * 4.5); // 50-450ms range
        return new Promise(resolve => setTimeout(resolve, Math.max(10, delay)));
    }
}

// Add a sleep function that works with animation speed
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, Math.max(10, ms)));
}

function stopCurrentOperation() {
    if (isSorting) {
        isSorting = false;
        currentOperation = null;
        // We need to resolve any pending step to allow the current operation to complete
        if (stepResolve) stepResolve();
    }
}

function updateRecursionDisplay(algorithm, left, right, pivot = null, subArrays = null) {
    // Clear any previous recursion display
    const oldDisplay = getElement('recursion-display');
    if (oldDisplay) oldDisplay.remove();
    
    const container = document.querySelector('.array-container');
    if (!container) return; // Safety check
    
    // Create recursion display container
    const recursionDisplay = document.createElement('div');
    recursionDisplay.id = 'recursion-display';
    recursionDisplay.classList.add('recursion-display');
    
    // Add title
    const title = document.createElement('h4');
    title.textContent = `${algorithm} Recursion Visualization`;
    recursionDisplay.appendChild(title);
    
    // Show current subarray range
    const rangeInfo = document.createElement('div');
    rangeInfo.classList.add('recursion-info');
    rangeInfo.textContent = `Current range: [${left} ... ${right}]`;
    recursionDisplay.appendChild(rangeInfo);
    
    // For Quick Sort, show pivot
    if (pivot !== null) {
        const pivotInfo = document.createElement('div');
        pivotInfo.classList.add('recursion-info');
        pivotInfo.textContent = `Pivot: ${arr[pivot]} (index ${pivot})`;
        recursionDisplay.appendChild(pivotInfo);
    }
    
    // For Merge Sort, show subarrays being merged
    if (subArrays !== null) {
        const subArrayInfo = document.createElement('div');
        subArrayInfo.classList.add('recursion-info');
        subArrayInfo.innerHTML = `Merging: [${subArrays.left.join(', ')}] and [${subArrays.right.join(', ')}]`;
        recursionDisplay.appendChild(subArrayInfo);
    }
    
    // Add the recursion display before the array container
    container.parentNode.insertBefore(recursionDisplay, container);
    
    // Update complexity information in status
    const statusElement = getElement("operation-status");
    if (statusElement) {
        if (algorithm === 'Merge Sort') {
            statusElement.textContent = `Running Merge Sort... Working on subarray [${left}...${right}]. O(n log n) time complexity`;
        } else if (algorithm === 'Quick Sort') {
            statusElement.textContent = `Running Quick Sort... Working on subarray [${left}...${right}]. O(n log n) average time complexity`;
        }
    }
}

// =========================
// SORTING ALGORITHMS
// =========================

async function startSorting(type) {
    // Stop any current operation
    stopCurrentOperation();
    
    // Set flags
    isSorting = true;
    currentOperation = type;
    
    // Reset array display
    renderArray();
    
    // Update status
    const statusElement = getElement("operation-status");
    statusElement.textContent = `Running ${type}...`;
    
    try {
        if (type === 'bubbleSort') {
            statusElement.textContent = "Running Bubble Sort... O(n²) time complexity";
            await bubbleSort();
        }
        else if (type === 'insertionSort') {
            statusElement.textContent = "Running Insertion Sort... O(n²) time complexity";
            await insertionSort();
        }
        else if (type === 'selectionSort') {
            statusElement.textContent = "Running Selection Sort... O(n²) time complexity";
            await selectionSort();
        }
        else if (type === 'mergeSort') {
            statusElement.textContent = "Running Merge Sort... O(n log n) time complexity";
            await mergeSort(0, arr.length - 1);
        }
        else if (type === 'quickSort') {
            statusElement.textContent = "Running Quick Sort... O(n log n) average time complexity";
            await quickSort(0, arr.length - 1);
        }
        
        // Highlight completion
        if (isSorting) {
            statusElement.textContent = `${type} completed!`;
            // Add sorted class to all elements
            const elements = document.querySelectorAll('.box');
            elements.forEach(el => el.classList.add('sorted'));
            
            setTimeout(() => {
                if (isSorting) {
                    elements.forEach(el => el.classList.remove('sorted'));
                    renderArray();
                }
            }, 2000);
        }
    } catch (error) {
        console.error("Sort operation was stopped or encountered an error:", error);
        if (error.message !== "Sort operation stopped") {
            statusElement.textContent = `Error: ${error.message}`;
        }
    } finally {
        if (!isSorting) {
            statusElement.textContent = "Operation stopped.";
        }
    }
}

// Bubble Sort
async function bubbleSort() {
    for (let i = 0; i < arr.length - 1; i++) {
        let swapped = false;
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (!isSorting) throw new Error("Sort operation stopped");
            
            renderArray([j, j + 1]);
            await waitForNextStep();
            
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
                renderArray([j, j + 1]);
                await waitForNextStep();
            }
        }
        // Optimization: if no swaps were made in a pass, the array is sorted
        if (!swapped) break;
    }
}

// Insertion Sort
async function insertionSort() {
    for (let i = 1; i < arr.length; i++) {
        if (!isSorting) throw new Error("Sort operation stopped");
        
        let key = arr[i];
        let j = i - 1;
        
        renderArray([i]);
        await waitForNextStep();
        
        while (j >= 0 && arr[j] > key) {
            if (!isSorting) throw new Error("Sort operation stopped");
            
            arr[j + 1] = arr[j];
            renderArray([j, j + 1]);
            await waitForNextStep();
            j = j - 1;
        }
        
        arr[j + 1] = key;
        renderArray([j + 1]);
        await waitForNextStep();
    }
}

// Selection Sort
async function selectionSort() {
    for (let i = 0; i < arr.length - 1; i++) {
        if (!isSorting) throw new Error("Sort operation stopped");
        
        let minIndex = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (!isSorting) throw new Error("Sort operation stopped");
            
            renderArray([minIndex, j]);
            await waitForNextStep();
            
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
            renderArray([i, minIndex]);
            await waitForNextStep();
        }
    }
}

// Enhanced Merge Sort
async function mergeSort(left, right, depth = 0) {
    if (!isSorting) throw new Error("Sort operation stopped");
    if (left >= right) return;
    
    // Show current recursion state
    updateRecursionDisplay('Merge Sort', left, right);
    
    // Create visual divider for this recursive call
    const currentRange = [];
    for (let i = left; i <= right; i++) {
        currentRange.push(i);
    }
    
    // Highlight the current subarray being worked on
    renderArray(currentRange);
    await waitForNextStep();
    
    // Calculate the midpoint
    let mid = Math.floor((left + right) / 2);
    
    // Visualize the division
    const leftRange = [];
    const rightRange = [];
    
    for (let i = left; i <= mid; i++) leftRange.push(i);
    for (let i = mid + 1; i <= right; i++) rightRange.push(i);
    
    // Color-code the two subarrays
    renderArrayWithSubArrays(leftRange, rightRange);
    await waitForNextStep();
    
    // Make recursive calls
    await mergeSort(left, mid, depth + 1);
    await mergeSort(mid + 1, right, depth + 1);
    
    // Merge the sorted subarrays
    await merge(left, mid, right);
}

async function merge(left, mid, right) {
    if (!isSorting) throw new Error("Sort operation stopped");
    
    // Get subarrays for visualization
    const leftSubArray = arr.slice(left, mid + 1);
    const rightSubArray = arr.slice(mid + 1, right + 1);
    
    // Show merging step
    updateRecursionDisplay('Merge Sort', left, right, null, {
        left: leftSubArray,
        right: rightSubArray
    });
    
    let temp = [];
    let i = left, j = mid + 1;
    
    // Create a range of indices for visualization
    let currentRange = [];
    for (let k = left; k <= right; k++) {
        currentRange.push(k);
    }
    renderArray(currentRange);
    await waitForNextStep();
    
    // Add visual indicators for the merge process
    const arrayContainer = document.querySelector('.array-container');
    if (!arrayContainer) return; // Safety check
    
    const mergeSteps = document.createElement('div');
    mergeSteps.classList.add('merge-steps');
    mergeSteps.innerHTML = '<h4>Merge Steps:</h4>';
    arrayContainer.appendChild(mergeSteps);
    
    while (i <= mid && j <= right) {
        if (!isSorting) throw new Error("Sort operation stopped");
        
        // Highlight the two elements being compared
        renderArray([i, j]);
        
        // Add comparison info
        const comparisonStep = document.createElement('div');
        comparisonStep.classList.add('merge-step');
        comparisonStep.textContent = `Comparing: ${arr[i]} vs ${arr[j]}`;
        mergeSteps.appendChild(comparisonStep);
        
        await waitForNextStep();
        
        // Add selection info
        const selectionStep = document.createElement('div');
        selectionStep.classList.add('merge-step');
        
        if (arr[i] <= arr[j]) {
            selectionStep.textContent = `Selected: ${arr[i]} (from left subarray)`;
            temp.push(arr[i++]);
        } else {
            selectionStep.textContent = `Selected: ${arr[j]} (from right subarray)`;
            temp.push(arr[j++]);
        }
        
        mergeSteps.appendChild(selectionStep);
        await waitForNextStep();
    }
    
    // Handle remaining elements
    while (i <= mid) {
        if (!isSorting) throw new Error("Sort operation stopped");
        
        renderArray([i]);
        
        const remainingStep = document.createElement('div');
        remainingStep.classList.add('merge-step');
        remainingStep.textContent = `Adding remaining left element: ${arr[i]}`;
        mergeSteps.appendChild(remainingStep);
        
        temp.push(arr[i++]);
        await waitForNextStep();
    }
    
    while (j <= right) {
        if (!isSorting) throw new Error("Sort operation stopped");
        
        renderArray([j]);
        
        const remainingStep = document.createElement('div');
        remainingStep.classList.add('merge-step');
        remainingStep.textContent = `Adding remaining right element: ${arr[j]}`;
        mergeSteps.appendChild(remainingStep);
        
        temp.push(arr[j++]);
        await waitForNextStep();
    }
    
    // Copy back to the original array
    const finalArray = document.createElement('div');
    finalArray.classList.add('merge-step');
    finalArray.textContent = `Merged result: [${temp.join(', ')}]`;
    mergeSteps.appendChild(finalArray);
    
    for (let k = left; k <= right; k++) {
        if (!isSorting) throw new Error("Sort operation stopped");
        
        arr[k] = temp[k - left];
        renderArray([k]);
        await waitForNextStep();
    }
    
    // Remove merge steps display after completion
    setTimeout(() => {
        if (mergeSteps && mergeSteps.parentNode) {
            mergeSteps.parentNode.removeChild(mergeSteps);
        }
    }, 500);
}

// Enhanced Quick Sort with Error Handling
async function quickSort(left, right, depth = 0) {
    if (!isSorting) throw new Error("Sort operation stopped");
    if (left >= right) return;
    
    // Show current recursion state
    updateRecursionDisplay('Quick Sort', left, right);
    
    // Create visual divider for this recursive call
    const currentRange = [];
    for (let i = left; i <= right; i++) {
        currentRange.push(i);
    }
    
    // Highlight the current subarray being worked on
    renderArray(currentRange);
    await sleep(animationSpeed * 3); // Use sleep with adjusted timing
    
    let pivotIndex = await partition(left, right);
    
    // Safety check in case sorting was stopped
    if (!isSorting) return;
    
    // Update recursion display to show partition result
    updateRecursionDisplay('Quick Sort', left, right, pivotIndex);
    
    // Visually show the partition result with safety checks
    const arrayElements = document.querySelectorAll('.box');
    if (arrayElements.length === 0) return; // Safety check
    
    // Mark elements before pivot (less than pivot)
    for (let i = left; i < pivotIndex; i++) {
        if (i >= 0 && i < arrayElements.length) {
            arrayElements[i].classList.add('less-than-pivot');
        }
    }
    
    // Mark pivot
    if (pivotIndex >= 0 && pivotIndex < arrayElements.length) {
        arrayElements[pivotIndex].classList.add('pivot-element');
    }
    
    // Mark elements after pivot (greater than pivot)
    for (let i = pivotIndex + 1; i <= right; i++) {
        if (i >= 0 && i < arrayElements.length) {
            arrayElements[i].classList.add('greater-than-pivot');
        }
    }
    
    await sleep(animationSpeed * 3);
    
    // Safety check again
    if (!isSorting) return;
    
    // Remove special classes - with safety check
    const updatedElements = document.querySelectorAll('.box');
    updatedElements.forEach(el => {
        el.classList.remove('less-than-pivot');
        el.classList.remove('pivot-element');
        el.classList.remove('greater-than-pivot');
    });
    
    // Recursive calls - process smaller partition first for better performance
    if (pivotIndex - left < right - pivotIndex) {
        await quickSort(left, pivotIndex - 1, depth + 1);
        await quickSort(pivotIndex + 1, right, depth + 1);
    } else {
        await quickSort(pivotIndex + 1, right, depth + 1);
        await quickSort(left, pivotIndex - 1, depth + 1);
    }
}

async function partition(left, right) {
    if (!isSorting) throw new Error("Sort operation stopped");
    
    // Use median-of-three for better pivot selection
    const mid = Math.floor((left + right) / 2);
    
    // Sort left, mid, right
    if (arr[left] > arr[mid]) [arr[left], arr[mid]] = [arr[mid], arr[left]];
    if (arr[left] > arr[right]) [arr[left], arr[right]] = [arr[right], arr[left]];
    if (arr[mid] > arr[right]) [arr[mid], arr[right]] = [arr[right], arr[mid]];
    
    // Place pivot at right-1
    [arr[mid], arr[right-1]] = [arr[right-1], arr[mid]];
    let pivot = arr[right-1];
    let i = left;
    
    // Create a unique ID for this partition's info element
    const partitionId = `partition-info-${left}-${right}`;
    
    // First check if a partition info with this ID already exists and remove it
    const existingInfo = getElement(partitionId);
    if (existingInfo) {
        try {
            existingInfo.parentNode.removeChild(existingInfo);
        } catch (e) {
            console.log("Error removing existing partition info:", e);
        }
    }
    
    // Add partition info display
    const container = document.querySelector('.array-container');
    if (!container) return left; // Safety check
    
    const partitionInfo = document.createElement('div');
    partitionInfo.classList.add('partition-info');
    partitionInfo.id = partitionId;
    partitionInfo.innerHTML = `<h4>Partition [${left}...${right}]</h4><p>Pivot: ${pivot} (index ${right-1})</p>`;
    
    try {
        container.appendChild(partitionInfo);
    } catch (e) {
        console.log("Error appending partition info:", e);
        // Continue without visualization if there's an error
    }
    
    // Highlight pivot
    renderArray([right-1]);
    await sleep(animationSpeed * 3);
    
    // Check if sorting has been stopped
    if (!isSorting) return left;
    
    for (let j = left; j < right-1; j++) {
        if (!isSorting) return left;
        
        // Check if our info element still exists
        const currentInfo = getElement(partitionId);
        
        if (currentInfo) {
            // Update comparison info
            currentInfo.innerHTML = `<h4>Partition [${left}...${right}]</h4>
                                     <p>Pivot: ${pivot} (index ${right-1})</p>
                                     <p>Comparing: ${arr[j]} with pivot ${pivot}</p>`;
        }
        
        renderArray([j, right-1]);
        await sleep(animationSpeed * 2);
        
        if (!isSorting) return left;
        
        if (arr[j] < pivot) {
            // Update swap info in the UI
            const swapInfo = getElement(partitionId);
            if (swapInfo && i !== j) {
                swapInfo.innerHTML = `<h4>Partition [${left}...${right}]</h4>
                                      <p>Pivot: ${pivot} (index ${right-1})</p>
                                      <p>Swapping: ${arr[i]} (index ${i}) with ${arr[j]} (index ${j})</p>`;
            }
            
            [arr[i], arr[j]] = [arr[j], arr[i]];
            renderArray([i, j]);
            await sleep(animationSpeed * 3);
            i++;
        }
    }
    
    if (!isSorting) return left;
    
    // Check again if our element exists
    const finalInfo = getElement(partitionId);
    if (finalInfo) {
        // Final pivot placement
        finalInfo.innerHTML = `<h4>Partition [${left}...${right}]</h4>
                              <p>Placing pivot ${pivot} at its final position</p>
                              <p>Swapping: ${arr[i]} (index ${i}) with ${arr[right-1]} (index ${right-1})</p>`;
    }
    
    [arr[i], arr[right-1]] = [arr[right-1], arr[i]];
    renderArray([i, right-1]);
    await sleep(animationSpeed * 4);
    
    if (!isSorting) return left;
    
    // Check again before final update
    const resultInfo = getElement(partitionId);
    if (resultInfo) {
        // Show partition result
        resultInfo.innerHTML = `<h4>Partition Complete</h4>
                              <p>Pivot ${pivot} is now at index ${i}</p>
                              <p>All elements to the left are smaller, all to the right are larger</p>`;
        
        await sleep(animationSpeed * 3);
        
        // Safe removal with check
        try {
            if (resultInfo.parentNode) {
                resultInfo.parentNode.removeChild(resultInfo);
            }
        } catch (e) {
            console.log("Error removing partition info:", e);
        }
    }
    
    return i;
}

// =========================
// SEARCHING ALGORITHMS
// =========================

// Enhanced Linear Search with detailed visualization
async function linearSearch(target) {
    // Create search info display
    const container = document.querySelector('.array-container');
    const searchInfo = document.createElement('div');
    searchInfo.classList.add('search-info');
    searchInfo.innerHTML = `<h4>Linear Search</h4><p>Target: ${target}</p><p>Checking each element sequentially from left to right.</p>`;
    container.parentNode.insertBefore(searchInfo, container.nextSibling);
    
    // Update status element with more details
    const statusElement = document.getElementById("operation-status");
    statusElement.textContent = `Running Linear Search... Target: ${target}. O(n) time complexity - checking each element sequentially.`;
    
    // Track the number of comparisons for educational purposes
    let comparisons = 0;
    
    // Create comparison counter element
    const comparisonCounter = document.createElement('div');
    comparisonCounter.classList.add('comparison-counter');
    comparisonCounter.textContent = `Comparisons: ${comparisons}`;
    searchInfo.appendChild(comparisonCounter);
    
    for (let i = 0; i < arr.length; i++) {
        if (!isSorting) {
            // Clean up before exiting
            if (searchInfo.parentNode) searchInfo.parentNode.removeChild(searchInfo);
            throw new Error("Search operation stopped");
        }
        
        // Update search info
        searchInfo.innerHTML = `<h4>Linear Search</h4>
                              <p>Target: ${target}</p>
                              <p>Checking index ${i}: ${arr[i]}</p>
                              <p>Comparisons: ${++comparisons}</p>`;
        
        // Highlight current element
        renderArray([i]);
        await waitForNextStep();
        
        // Show comparison result
        const comparisonResult = document.createElement('div');
        comparisonResult.classList.add('comparison-result');
        
        if (arr[i] === target) {
            // Mark as found with special effect
            comparisonResult.textContent = `✓ Found ${target} at index ${i}!`;
            comparisonResult.classList.add('found');
            searchInfo.appendChild(comparisonResult);
            
            // Highlight the found element with special effect
            const elements = document.querySelectorAll('.box');
            elements[i].classList.add('found');
            
            // Allow time to see the result before cleaning up
            await sleep(animationSpeed * 10);
            
            // Clean up search info
            if (searchInfo.parentNode) searchInfo.parentNode.removeChild(searchInfo);
            
            return i;
        } else {
            // Show the comparison as not equal
            comparisonResult.textContent = `${arr[i]} ≠ ${target}, continue searching...`;
            searchInfo.appendChild(comparisonResult);
            
            // Allow a brief moment to see the comparison result
            await sleep(animationSpeed * 2);
            
            // Remove the result after seeing it
            if (comparisonResult.parentNode) comparisonResult.parentNode.removeChild(comparisonResult);
        }
    }
    
    // If we reach here, target was not found
    searchInfo.innerHTML = `<h4>Linear Search Complete</h4>
                          <p>Target: ${target}</p>
                          <p>Result: Not found after ${comparisons} comparisons</p>
                          <p>This is a worst-case scenario for linear search: O(n)</p>`;
    
    // Allow time to see the final result
    await sleep(animationSpeed * 10);
    
    // Clean up search info
    if (searchInfo.parentNode) searchInfo.parentNode.removeChild(searchInfo);
    
    return -1;
}

// Enhanced Binary Search with detailed visualization
async function binarySearch(target) {
    // Create search info display
    const container = document.querySelector('.array-container');
    const searchInfo = document.createElement('div');
    searchInfo.classList.add('search-info');
    searchInfo.innerHTML = `<h4>Binary Search</h4>
                          <p>Target: ${target}</p>
                          <p>Dividing the sorted array in half with each step.</p>
                          <p><strong>Note:</strong> Binary search requires a sorted array!</p>`;
    container.parentNode.insertBefore(searchInfo, container.nextSibling);
    
    // Update status element with more details
    const statusElement = document.getElementById("operation-status");
    statusElement.textContent = `Running Binary Search... Target: ${target}. O(log n) time complexity - dividing search space in half each time.`;
    
    // Track the number of comparisons for educational purposes
    let comparisons = 0;
    let steps = 0;
    
    let left = 0, right = arr.length - 1;
    
    // Initially show the full array being considered
    let searchRange = [];
    for (let i = left; i <= right; i++) {
        searchRange.push(i);
    }
    renderArray(searchRange);
    await waitForNextStep();
    
    // Add visual step counter
    const stepCounter = document.createElement('div');
    stepCounter.classList.add('step-counter');
    stepCounter.textContent = `Step: ${steps}`;
    searchInfo.appendChild(stepCounter);
    
    while (left <= right) {
        if (!isSorting) {
            // Clean up before exiting
            if (searchInfo.parentNode) searchInfo.parentNode.removeChild(searchInfo);
            throw new Error("Search operation stopped");
        }
        
        steps++;
        let mid = Math.floor((left + right) / 2);
        
        // Update search info for this step
        searchInfo.innerHTML = `<h4>Binary Search - Step ${steps}</h4>
                              <p>Target: ${target}</p>
                              <p>Current range: [${left}...${right}]</p>
                              <p>Middle index: ${mid}, Value: ${arr[mid]}</p>
                              <p>Comparisons: ${++comparisons}</p>`;
        
        // Highlight current search range
        searchRange = [];
        for (let i = left; i <= right; i++) {
            searchRange.push(i);
        }
        
        // Use a special rendering function to show the binary partition
        renderBinarySearchStep(searchRange, mid, left, right);
        await waitForNextStep();
        
        // Show comparison
        const comparisonResult = document.createElement('div');
        comparisonResult.classList.add('comparison-result');
        
        if (arr[mid] === target) {
            // Target found
            comparisonResult.textContent = `✓ Found ${target} at index ${mid}!`;
            comparisonResult.classList.add('found');
            searchInfo.appendChild(comparisonResult);
            
            // Show mathematical analysis of binary search efficiency
            const efficiencyAnalysis = document.createElement('div');
            efficiencyAnalysis.classList.add('efficiency-analysis');
            efficiencyAnalysis.innerHTML = `<h4>Binary Search Efficiency</h4>
                                          <p>Found in ${steps} steps (comparisons: ${comparisons})</p>
                                          <p>Array size: ${arr.length} elements</p>
                                          <p>Theoretical maximum steps: ⌊log₂(${arr.length})⌋ + 1 = ${Math.floor(Math.log2(arr.length)) + 1}</p>
                                          <p>This is why binary search is O(log n) - much faster than linear search for large arrays!</p>`;
            searchInfo.appendChild(efficiencyAnalysis);
            
            // Highlight the found element with special effect
            const elements = document.querySelectorAll('.box');
            elements[mid].classList.add('found');
            
            // Allow time to see the result before cleaning up
            await sleep(animationSpeed * 15);
            
            // Clean up search info
            if (searchInfo.parentNode) searchInfo.parentNode.removeChild(searchInfo);
            
            return mid;
        } else if (arr[mid] < target) {
            // Target is in the right half
            comparisonResult.textContent = `${arr[mid]} < ${target}, searching right half`;
            comparisonResult.classList.add('search-right');
            searchInfo.appendChild(comparisonResult);
            
            // Show which half we're eliminating
            const elements = document.querySelectorAll('.box');
            for (let i = left; i <= mid; i++) {
                if (elements[i]) elements[i].classList.add('eliminated');
            }
            
            await sleep(animationSpeed * 5);
            
            // Update search range
            left = mid + 1;
        } else {
            // Target is in the left half
            comparisonResult.textContent = `${arr[mid]} > ${target}, searching left half`;
            comparisonResult.classList.add('search-left');
            searchInfo.appendChild(comparisonResult);
            
            // Show which half we're eliminating
            const elements = document.querySelectorAll('.box');
            for (let i = mid; i <= right; i++) {
                if (elements[i]) elements[i].classList.add('eliminated');
            }
            
            await sleep(animationSpeed * 5);
            
            // Update search range
            right = mid - 1;
        }
        
        // Allow time to see the decision before continuing
        await waitForNextStep();
        
        // Remove the comparison result before the next step
        if (comparisonResult.parentNode) comparisonResult.parentNode.removeChild(comparisonResult);
    }
    
    // If we reach here, target was not found
    searchInfo.innerHTML = `<h4>Binary Search Complete</h4>
                          <p>Target: ${target}</p>
                          <p>Result: Not found after ${steps} steps (${comparisons} comparisons)</p>
                          <p>Search range exhausted - target ${target} is not in the array</p>
                          <p>Even when the target is not found, binary search is still O(log n) - much more efficient than linear search</p>`;
    
    // Allow time to see the final result
    await sleep(animationSpeed * 10);
    
    // Clean up search info
    if (searchInfo.parentNode) searchInfo.parentNode.removeChild(searchInfo);
    
    return -1;
}

// Helper function to render binary search visualization
function renderBinarySearchStep(rangeIndices, midIndex, leftBound, rightBound) {
    const container = document.querySelector('.array-container');
    if (!container) return; // Safety check
    
    // Store existing info elements
    const infoElements = [];
    document.querySelectorAll('.search-info').forEach(el => {
        infoElements.push({
            element: el,
            parentNode: el.parentNode
        });
    });
    
    container.innerHTML = '';
    
    // Find max value for scaling
    const maxValue = Math.max(...arr, 1);
    
    arr.forEach((value, index) => {
        let box = document.createElement('div');
        box.classList.add('box');
        box.textContent = value;
        box.dataset.index = index;
        
        // Make height relative to value
        const heightPercentage = (value / maxValue) * 100;
        box.style.height = `${Math.max(20, heightPercentage)}px`;
        
        // Add classes based on binary search state
        if (index === midIndex) {
            box.classList.add('mid-element');
        } else if (index >= leftBound && index <= rightBound) {
            box.classList.add('search-range');
        } else {
            box.classList.add('out-of-range');
        }
        
        // If this element has been eliminated in previous steps
        if (!rangeIndices.includes(index) && index >= 0 && index < arr.length) {
            box.classList.add('eliminated');
        }
        
        container.appendChild(box);
    });
    
    // Re-add info elements
    infoElements.forEach(info => {
        try {
            if (info.parentNode && info.element) {
                info.parentNode.appendChild(info.element);
            }
        } catch (e) {
            console.log("Error re-adding info elements:", e);
        }
    });
}

// Add function to check if array is fully sorted
function isSorted(array) {
    for (let i = 1; i < array.length; i++) {
        if (array[i] < array[i - 1]) return false;
    }
    return true;
}

// Add a special visualization for the binary search prerequisite check
async function visualizeSortCheck() {
    const container = document.querySelector('.array-container');
    const statusElement = document.getElementById("operation-status");
    
    const checkInfo = document.createElement('div');
    checkInfo.classList.add('sort-check-info');
    checkInfo.innerHTML = `<h4>Binary Search Prerequisite Check</h4>
                        <p>Verifying if the array is sorted (required for binary search)</p>`;
    container.parentNode.insertBefore(checkInfo, container.nextSibling);
    
    let sorted = true;
    
    // Visualize the check
    for (let i = 1; i < arr.length; i++) {
        // Highlight the pair being checked
        renderArray([i-1, i]);
        
        checkInfo.innerHTML = `<h4>Binary Search Prerequisite Check</h4>
                             <p>Checking if ${arr[i-1]} ≤ ${arr[i]}</p>`;
        
        await sleep(animationSpeed * 2);
        
        if (arr[i] < arr[i-1]) {
            sorted = false;
            checkInfo.innerHTML = `<h4>Binary Search Prerequisite Check</h4>
                                 <p>Array is NOT sorted! Found ${arr[i-1]} > ${arr[i]}</p>
                                 <p>Binary search requires a sorted array to work correctly</p>
                                 <p>Sorting the array now...</p>`;
            
            statusElement.textContent = "Array must be sorted for binary search. Sorting now...";
            await sleep(animationSpeed * 10);
            break;
        }
    }
    
    if (sorted) {
        checkInfo.innerHTML = `<h4>Binary Search Prerequisite Check</h4>
                             <p>✓ Array is properly sorted!</p>
                             <p>Binary search can proceed</p>`;
        await sleep(animationSpeed * 5);
    } else {
        // Sort the array if not sorted
        arr.sort((a, b) => a - b);
        renderArray();
        
        checkInfo.innerHTML = `<h4>Binary Search Prerequisite Check</h4>
                             <p>✓ Array has been sorted in ascending order</p>
                             <p>Binary search can now proceed</p>`;
        await sleep(animationSpeed * 5);
    }
    
    // Clean up
    if (checkInfo.parentNode) checkInfo.parentNode.removeChild(checkInfo);
}

// Modify the startSearching function to include the enhanced visualization for binary search
async function startSearching(type) {
    // Stop any current operation
    stopCurrentOperation();
    
    // Set flags
    isSorting = true;
    currentOperation = type;
    
    let target = parseInt(document.getElementById("target").value);
    if (isNaN(target)) {
        alert("Please enter a valid target value");
        isSorting = false;
        return;
    }
    
    // Reset array display
    renderArray();
    
    // Update status
    const statusElement = document.getElementById("operation-status");
    
    try {
        let result;
        if (type === 'linearSearch') {
            statusElement.textContent = "Running Linear Search... O(n) time complexity";
            result = await linearSearch(target);
        } else if (type === 'binarySearch') {
            // Check if array is sorted for binary search with visualization
            if (!isSorted(arr)) {
                await visualizeSortCheck();
            } else {
                statusElement.textContent = "Running Binary Search... O(log n) time complexity";
            }
            result = await binarySearch(target);
        }
        
        // Show result
        if (result !== -1) {
            statusElement.textContent = `Target ${target} found at index ${result}!`;
            // Add found class to found element
            const elements = document.querySelectorAll('.box');
            elements[result].classList.add('found');
        } else {
            statusElement.textContent = `Target ${target} not found in the array.`;
        }
    } catch (error) {
        console.error("Search operation was stopped or encountered an error:", error);
        if (error.message !== "Search operation stopped") {
            statusElement.textContent = `Error: ${error.message}`;
        }
    } finally {
        if (!isSorting) {
            statusElement.textContent = "Operation stopped.";
        }
    }
}