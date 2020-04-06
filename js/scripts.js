var time = new Date();
var newTime = new Date();
var secondsSinceStart = 0;
var objectIteration = 0;

window.onbeforeunload = function(){
   save()
}

function save(){
	var idleSave = []
	data.forEach((prod) => {
		idleSave.push({"Name": prod.Name, "amount": prod.amount.value, "unlocked": prod.unlocked, "disabledSince": (prod.disabledSince%prod.Interval), "autoProduce": prod.autoProduce.value})
	})
	localStorage.setItem("data", JSON.stringify(idleSave))
}

function load() {
	var idleSave = JSON.parse(localStorage.getItem("data"))
	idleSave.forEach((prod) => {
		let obj = data.find(o => o.Name === prod.Name)
		let index = data.indexOf(obj)
		data[index].amount.value = prod.amount
		data[index].disabledSince = prod.disabledSince
		if(prod.unlocked){
			data[index].unlock()
		}
		data[index].autoProduce.value = prod.autoProduce
		data[index].autoProduce.draw()
		data[index].amount.draw()
	})
}

function getHex(max, dec) {
	let frac = 512 / max
	let dec2 = Math.round(frac * dec)
	let result = 'FF0000'
	if(dec2 < 256) {
		result = (255 - dec2).toString(16) + '0000'
	} else {
		result = '00' + (dec2 - 257).toString(16) + '00'
	}
	return '#' + result
}

function setup(){																																		//Allow disabling Automation
	data.forEach((product) => {
		product.autoProduce = {"value":true}
		
		product.requirements = {"dom":document.createElement('span')}
		
		product.unlocked = false
		product.amount = {"value":0}
		product.amount.last = {"value":0}
		
		product.unlock = function() {
			product.unlocked = true
			product.draw()
			product.disabledSince = 0
		}
		
		product.dom = document.createElement('div')
		
		product.button = {"dom":document.createElement('button')}
		product.button.clicked = function() {
			data.forEach((prod) => {
				prod.button.dom.disabled = true
			})
			product.disabledSince = secondsSinceStart
			product.pay()
			product.produce()
		}
		product.button.tip = {"dom":document.createElement('span')}
		
		product.autoProduce = {"dom":document.createElement('button')}
		
		product.autoProduce.innerHTML = "Produce"
		
		product.amount.dom = document.createElement('var')
		product.amount.delta = {"dom":document.createElement('var')}
		
		product.pay = function() {
			product.Cost.forEach((prod) => {
				let obj = data.find(o => o.Name === prod.Name)
				let index = data.indexOf(obj)
				data[index].amount.value -= prod.amount
				data[index].amount.draw()
			})
		}
		
		product.produce = function() {
			product.Production.forEach((prod) => {
				var boost = 1
				let obj = data.find(o => o.Name === prod.Name)
				let index = data.indexOf(obj)
				prod.affectedBy.forEach((aff) => {
					let obj = data.find(o => o.Name === aff.Name)
					let index = data.indexOf(obj)
					if(data[index].amount.value > 0) {
						boost *= (Math.pow(aff.Boost, data[index].amount.value))
					}
				})
				data[index].amount.value += (prod.amount * boost)
				data[index].amount.draw()
			})
		}
		
		product.requirements.draw = function() {
			if(product.Unlock.length > 0){
				var tempString
				if(product.unlocked) {
					tempString = "To craft me you need: "
				} else {
					tempString = "To unlock me you need: "
				}
				product.Cost.forEach((prod) => {
					tempString += prod.amount + " pieces of " + prod.Name
				})
			product.requirements.dom.innerHTML = tempString
			}
		}
		
		product.amount.draw = function() {
			product.amount.dom.innerHTML = Math.round(product.amount.value * 1000) / 1000
		}
		
		product.autoProduce.draw = function() {
			if(product.autoProduce.value) {
				product.autoProduce.dom.innerHTML = "Produce"
			} else {
				product.autoProduce.dom.innerHTML = "Pause"
			}
		}
		
		product.autoProduce.dom.onclick = function() {product.autoProduce.value = !product.autoProduce.value; product.autoProduce.draw()}
		
		product.amount.delta.draw = function() {
			if(product.amount.value - product.amount.last.value >= 0) {
				product.amount.delta.dom.className = "positive"
			} else {
				product.amount.delta.dom.className = "negative"
			}
			product.amount.delta.dom.innerHTML = '(' + Math.round((product.amount.value - product.amount.last.value) * 1000) / 1000 + ')'
		}
		
		product.draw = function() {
			if(product.unlocked == false) {
				product.button.dom.style.visibility = 'hidden'
				product.amount.dom.style.visibility = 'hidden'
				product.amount.delta.dom.style.visibility = 'hidden'
			} else {
				product.button.dom.style.visibility = 'visible'
				product.amount.dom.style.visibility = 'visible'
				product.amount.delta.dom.style.visibility = 'visible'
			}
			product.requirements.draw()
		}
		
		product.button.draw = function() {
			product.dombutton.innerHTML = '<p>' + product.Name + '</p>'
		}
		
		if(product.AutoProduction.length > 0){
			product.autoProduce.dom.hidden = false
		} else {
			product.autoProduce.dom.hidden = true
		}
		
		product.button.dom.className = "tooltip"
		product.button.dom.style.backgroundColor = '#00FF00'
		product.button.dom.disabled = true;
		product.button.dom.onclick = product.button.clicked
		product.button.dom.innerHTML = '<p>' + product.Name + '</p>'
		
		product.button.tip.dom.className = "tooltiptext"
		product.button.tip.dom.innerHTML = product.ToolTip
		
		product.amount.dom.innerHTML = product.amount.value
		product.amount.delta.dom.innerHTML = '(' + (product.amount.value - product.amount.last.value) + ')'
		
		product.button.dom.style.visibility = 'hidden'
		product.amount.dom.style.visibility = 'hidden'
		product.amount.delta.dom.style.visibility = 'hidden'
		
		product.draw()
		product.requirements.draw()
		
		product.button.dom.appendChild(product.button.tip.dom)
		product.dom.appendChild(product.button.dom)
		product.dom.appendChild(product.amount.dom)
		product.dom.appendChild(product.amount.delta.dom)
		product.dom.appendChild(product.autoProduce.dom)
		product.dom.appendChild(product.requirements.dom)
		document.body.appendChild(product.dom)
		
		product.AutoProduction.forEach((prod) => {
			prod.lastProduced = 0
		})
		
		product.Upkeep.forEach((prod) => {
			prod.lastPayed = 0
		})
	})
	if(localStorage.getItem("data") != null){
		load()
	}
	gameloopId = setInterval(Game, 10)
}

function Game() {
	newTime = new Date();
	if(time.getSeconds() != newTime.getSeconds()){
		time = newTime
		secondsSinceStart++
		
		data.forEach((prod) => {
			prod.amount.delta.draw()
			prod.amount.last.value = prod.amount.value
		})
	}
	
	if(secondsSinceStart % 5 == 0) {																													//AutoSave Every 5 seconds
		save()
	}
	
	if(objectIteration >= data.length){
		objectIteration = 0
	}
	
	if(data[objectIteration].unlocked == false){																										//Unlock new Item
		if(unlockCheck(data[objectIteration]) == true){
			data[objectIteration].unlock()
		}
	}
	
	if(data[objectIteration].disabledSince + data[objectIteration].Interval > secondsSinceStart) {														//Change Color
		data[objectIteration].button.dom.style.backgroundColor = (getHex(data[objectIteration].Interval, (secondsSinceStart - data[objectIteration].disabledSince)))
	}
	
	if((data[objectIteration].disabledSince == 0 || data[objectIteration].disabledSince + data[objectIteration].Interval <= secondsSinceStart) && data[objectIteration].button.dom.disabled) {			//Unlock buttons and update last color
		if(costCheck(data[objectIteration])){
			data[objectIteration].button.dom.disabled = false
			data[objectIteration].disabledSince = 0
		}
		data[objectIteration].button.dom.style.backgroundColor = '#00FF00'
	}
	
	if(data[objectIteration].autoProduce.value) {
		if(data[objectIteration].amount.value > 0) {																											//Calc if can pay cost then AutoProduction
			var payed = false
			if(data[objectIteration].Upkeep.length > 0) {
				if (upkeepCheck(data[objectIteration])) {																															//Upkeep is always payed even if not everything is Produced
					data[objectIteration].Upkeep.forEach((prod) => {
						if(prod.lastPayed + prod.interval < secondsSinceStart) {
							let obj = data.find(o => o.Name === prod.Name)
							let index = data.indexOf(obj)
							data[index].amount.value -= (prod.amount * data[objectIteration].amount.value)
							data[index].amount.draw()
							payed = true
							prod.lastPayed = secondsSinceStart
						}
					})
				}
			} else {
				payed = true
			}
			if(payed){
				data[objectIteration].AutoProduction.forEach((prod) => {																				
					if(prod.lastProduced + prod.interval < secondsSinceStart) {
						let obj = data.find(o => o.Name === prod.Name)
						let index = data.indexOf(obj)
						data[index].amount.value += (prod.amount * data[objectIteration].amount.value)
						data[index].amount.draw()
						prod.lastProduced = secondsSinceStart
					}
				})
			}
		}
	}
	
	objectIteration++
}

function unlockCheck(product){																															//Unlock new Item
	var unlockReqMet = true
	product.Unlock.forEach((prod) => {
		let obj = data.find(o => o.Name === prod.Name)
		let index = data.indexOf(obj)
		if(data[index].amount.value < prod.amount) {
			unlockReqMet = false
		}
	})
	return unlockReqMet
}

function costCheck(product){
	var unlockReqMet = true
		product.Cost.forEach((prod) => {
		let obj = data.find(o => o.Name === prod.Name)
		let index = data.indexOf(obj)
		if(data[index].amount.value < prod.amount) {
			unlockReqMet = false
		}
	})
	return unlockReqMet
}

function upkeepCheck(product) {
	var canAfford = true
	product.Upkeep.forEach((prod) => {
		let obj = data.find(o => o.Name === prod.Name)
		let index = data.indexOf(obj)
		if(data[index].amount.value < prod.amount * product.amount.value) {
			canAfford = false
		}
	})
	return canAfford
}

setup()