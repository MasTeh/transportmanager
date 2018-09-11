
function normalizePhone(phone){


    return '7'+phone.replace('(','').replace(')','').replace('-','').replace(' ','').replace('-','');


}

function normalizePhone2(phone){


    return phone.replace('(','').replace(')','').replace('-','').replace(' ','').replace('-','').replace('+7','7');


}

function toDate(dateStr) {
    const [day, month, year] = dateStr.split("-")
    return new Date(year, month - 1, day)
}

function arrayIndexById(arr) {

    var ind_array = {};

    for (var key in arr)
    {
        ind_array[arr[key]['id']] = arr[key];
    }

    return ind_array;
}


function randNum(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}

function setOption(object, option, value)
{
	if (object.option == undefined) object.option = 0;
	option.option = value;
}

function getOption(object, option, value)
{
	if (object.option == undefined)
		object.option = 0;
	return object.option;
}

function getFromLocalStorage(item, type)
{
	if (window.localStorage.getItem(item) !== null)
	{
		if (type=='str') return String(window.localStorage.getItem(item));
		if (type=='int') return Number(window.localStorage.getItem(item));
	}		
	else
	{
		if (type=='str') return '';
		if (type=='int') return 0;
	}
}

function print_r(arr, level) {
    var print_red_text = "";
    if(!level) level = 0;
    var level_padding = "";
    for(var j=0; j<level+1; j++) level_padding += "    ";
    if(typeof(arr) == 'object') {
        for(var item in arr) {
            var value = arr[item];
            if(typeof(value) == 'object') {
                print_red_text += level_padding + "'" + item + "' :\n";
                print_red_text += print_r(value,level+1);
        } 
            else 
                print_red_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
        }
    } 

    else  print_red_text = "===>"+arr+"<===("+typeof(arr)+")";
    return print_red_text;
}    


function include(src){
  var script = document.createElement('script');
  script.src = src;
  script.async = true; 
  document.head.appendChild(script);
}

function include_async(src){
  var script = document.createElement('script');
  script.src = src;
  script.async = false; 
  document.head.appendChild(script);
}