


var paleo = document.getElementById('paleo-crust-pizza');



var pepperoni = document.getElementById('pepperoni');

var name = document.getElementById('name');
var paleo = document.getElementsByName('name');

function checkFields(){
    if( paleo.value === paleo ){
        pepperoni.style.display = 'none';
    }else{
        pepperoni.style.display = 'inline-block';
    }
}

checkFields();




var source = document.querySelector("#name");
var target = document.querySelector(".checkboxGroup");

source.onchange = function () {
    if (this[this.selectedIndex].value === "paleo-crust-pizza") {
        target.classList.remove("show");
    } else {

        target.classList.add("show");
    }
};


var source = document.querySelector("#name");
// if (name.[source.selectedIndex].value === "paleo-crust-pizza"){
//
// }
var target = document.querySelector(".checkboxGroup");

source.onchange = function () {
    if (this[this.selectedIndex].value === "paleo-crust-pizza") {
        target.classList.add("none")
    } else {

        target.classList.remove("none");
    }
};





const hideChecks = document.querySelector('.checkboxGroup');
const paleo = document.getElementById('paleo-crust-pizza');
const name = document.getElementById('name');

hideChecks.style.display = 'none';


const paleo = document.getElementById('paleo-crust-pizza');

document.getElementById('name').addEventListener('change', function () {
    var style = this.value == 'paleo-crust-pizza' ? 'block' : 'none';
    document.getElementById('checkboxGroup').style.display = 'none';
});
