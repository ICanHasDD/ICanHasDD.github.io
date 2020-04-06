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
		idleSave.push({"Name": prod.Name, "amount": prod.amount, "unlocked": prod.unlocked, "disabledSince": (prod.disabledSince%prod.Interval)})
	})
	localStorage.setItem("data", JSON.stringify(idleSave))
}

function load() {
	var idleSave = JSON.parse(localStorage.getItem("data"))
	idleSave.forEach((prod) => {
		let obj = data.find(o => o.Name === prod.Name)
		let index = data.indexOf(obj)
		data[index].amount = prod.amount
		data[index].disabledSince = prod.disabledSince
		if(prod.unlocked){
			data[index].unlock()
		}
		data[index].draw()
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
	data.forEach((element) => {
		element.autoProduce = true
		element.lastAmount = 0
		element.unlocked = false
		element.amount = 0
		element.draw = function() {element.domvar.innerHTML = Math.round(element.amount * 1000) / 1000}
		element.unlock = function() {element.unlocked = true; element.domdiv.draw(); element.disabledSince = 0}
		
		element.domautobutton = document.createElement('button')
		element.domdiv = document.createElement('div')
		element.dombutton = document.createElement('button')
		element.dombuttontip = document.createElement('span')
		element.domvar = document.createElement('var')
		element.domdeltavar = document.createElement('var')
		
		element.domdeltavar.draw = function() {if(element.amount - element.lastAmount >= 0) {element.domdeltavar.className = "positive"} else {element.domdeltavar.className = "negative"}; element.domdeltavar.innerHTML = '(' + Math.round((element.amount - element.lastAmount) * 1000) / 1000 + ')'}
		
		element.clicked = function() {
			data.forEach((prod) => {
				prod.dombutton.disabled = true
			})
			element.disabledSince = secondsSinceStart
			element.pay()
			element.produce()
		}
		element.pay = function() {
			element.Cost.forEach((prod) => {
				let obj = data.find(o => o.Name === prod.Name)
				let index = data.indexOf(obj)
				data[index].amount -= prod.amount
				data[index].draw()
			})
		}
		element.produce = function() {
			element.Production.forEach((prod) => {
				var boost = 1
				let obj = data.find(o => o.Name === prod.Name)
				let index = data.indexOf(obj)
				prod.affectedBy.forEach((aff) => {
					let obj = data.find(o => o.Name === aff.Name)
					let index = data.indexOf(obj)
					if(data[index].amount > 0) {
						boost *= (Math.pow(aff.Boost, data[index].amount))
					}
				})
				data[index].amount += (prod.amount * boost)
				data[index].draw()
			})
		}
		
		element.domautobutton.onclick = function() {element.autoProduce = !element.autoProduce; if(element.autoProduce) {element.domautobutton.innerHTML = "Produce"} else {element.domautobutton.innerHTML = "Pause"}}
		element.domautobutton.innerHTML = "Produce"
		element.domautobutton.hidden = true
		
		element.dombutton.className = "tooltip"
		element.dombutton.style.backgroundColor = '#00FF00'
		element.dombutton.disabled = true;
		element.dombutton.onclick = element.clicked
		element.dombutton.innerHTML = '<p>' + element.Name + '</p>'
		
		element.dombuttontip.className = "tooltiptext"
		element.dombuttontip.innerHTML = element.ToolTip
		
		element.dombutton.draw = function() {
			element.dombutton.innerHTML = '<p>' + element.Name + '</p>'
		}
		
		element.domvar.innerHTML = element.amount
		element.domdeltavar.innerHTML = '(' + (element.amount - element.lastAmount) + ')'
		element.domdiv.style.visibility = 'hidden'
		
		element.domdiv.draw = function() {
			if(element.unlocked == false) {
				element.domdiv.style.visibility = 'hidden'
			} else {
				element.domdiv.style.visibility = 'visible'
			}
		}
		element.domdiv.draw()
		
		element.dombutton.appendChild(element.dombuttontip)
		element.domdiv.appendChild(element.dombutton)
		element.domdiv.appendChild(element.domvar)
		element.domdiv.appendChild(element.domdeltavar)
		element.domdiv.appendChild(element.domautobutton)
		document.body.appendChild(element.domdiv)
		
		element.AutoProduction.forEach((prod) => {
			prod.lastProduced = 0
		})
		
		element.Upkeep.forEach((prod) => {
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
			prod.domdeltavar.draw()
			prod.lastAmount = prod.amount
		})
	}
	
	if(secondsSinceStart % 5 == 0) {																													//AutoSave Every 5 seconds
		save()
	}
	
	if(objectIteration >= data.length){
		objectIteration = 0
	}
	
	if(data[objectIteration].unlocked == false){																										//Unlock new Item
		var unlockReqMet = true
		data[objectIteration].Unlock.forEach((prod) => {
			let obj = data.find(o => o.Name === prod.Name)
			let index = data.indexOf(obj)
			if(data[index].amount < prod.amount) {
				unlockReqMet = false
			}
		})
		if(unlockReqMet == true){
			data[objectIteration].unlock()
		}
	}
	
	if(data[objectIteration].disabledSince + data[objectIteration].Interval > secondsSinceStart) {														//Change Color
		data[objectIteration].dombutton.style.backgroundColor = (getHex(data[objectIteration].Interval, (secondsSinceStart - data[objectIteration].disabledSince)))
	}
	
	if(data[objectIteration].disabledSince == 0 || data[objectIteration].disabledSince + data[objectIteration].Interval <= secondsSinceStart) {														//Unlock buttons and update last color
		if(data[objectIteration].dombutton.disabled) {
			var unlockReqMet = true
				data[objectIteration].Cost.forEach((prod) => {
				let obj = data.find(o => o.Name === prod.Name)
				let index = data.indexOf(obj)
				if(data[index].amount < prod.amount) {
					unlockReqMet = false
				}
			})
			if(unlockReqMet == true){
				data[objectIteration].dombutton.disabled = false
				data[objectIteration].disabledSince = 0
			}
		}
		data[objectIteration].dombutton.style.backgroundColor = '#00FF00'
	}
	
	if(data[objectIteration].autoProduce) {
		if(data[objectIteration].amount > 0) {																												//Calc if can pay cost then AutoProduction
			var produced = false
			var canAfford = true
			data[objectIteration].Upkeep.forEach((prod) => {
				let obj = data.find(o => o.Name === prod.Name)
				let index = data.indexOf(obj)
				if(data[index].amount < prod.amount * data[objectIteration].amount) {
					canAfford = false
				}
			})
			if(canAfford){
				data[objectIteration].AutoProduction.forEach((prod) => {																					//Upkeep is always payed even if not everything is Produced
					if(prod.lastProduced + prod.interval < secondsSinceStart) {
						let obj = data.find(o => o.Name === prod.Name)
						let index = data.indexOf(obj)
						data[index].amount += (prod.amount * data[objectIteration].amount)
						data[index].draw()
						produced = true
					}
				})
				if (produced) {
					data[objectIteration].Upkeep.forEach((prod) => {
						if(prod.lastPayed + prod.interval < secondsSinceStart) {
							let obj = data.find(o => o.Name === prod.Name)
							let index = data.indexOf(obj)
							data[index].amount -= (prod.amount * data[objectIteration].amount)
							data[index].draw()
						}
					})
				}
			}
		}
	}
	
	objectIteration++
}

setup()