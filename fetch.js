
 document.addEventListener('DOMContentLoaded', function() {
    let elems = document.querySelectorAll('.modal');
    window.instances = M.Modal.init(elems,{dismissible:false});

  });

window.addEventListener('load',async ()=>{
    if(checkDatabase()){;
    kuchbhi();
}
    // load("465441","12-05-2021");
});

async function kuchbhi(){
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth()+1;
    if(month.toString().length==1) month = "0"+month;
    const year = date.getFullYear();
    date = `${day}-${month}-${year}`;
    let weekIteration = 0;
    let promises = [];
    while(weekIteration<4){
        let _day = day+7*weekIteration;
        if(_day.toString().length==1) _day = "0"+_day;
        promises.push(load(window.pincode,`${_day}-${month}-${year}`));
        weekIteration++;
    }
    promises = await Promise.all(promises);
    window.results = promises;
    let temp = 0;
    cleanUp(0)
    for(let promise of promises){
        if(promise.length!=0){
            temp++;
            for(let r of promise){
                render(r['date'],r['center'],r['available_capacity'],r['slots'],r['age'])
            }
        }
    }
    document.getElementById('target').style.display = "block"
    console.log(temp,'clenaup')
    cleanUp(temp);
}
function checkDatabase(){
    const pincode = localStorage.getItem('pincode');
    
    if(!pincode){
        window.instances[0].open();
    }
    else{
        window.pincode = pincode;
        // document.getElementById('pincode').value = pincode;
       
    }
    return pincode;
}

function changePincode(){
    window.instances[0].open();
}

function setPincode(e){
    
    const pincode = document.getElementById('setPincode');
    if(String(pincode.value).length!=6){
        return alert('Enter valid pincode')
    }
    localStorage.setItem('pincode',pincode.value);
    window.pincode = pincode.value;
    window.instances[0].close();
    document.getElementById('filter').checked = false
    kuchbhi();
}
function render(date,center,available_capacity,slots,age,filter=false){
  if(filter){
      if(age!=18) return;
  }
  let target =   document.getElementById('target');
  let listItem = document.createElement('li');
  listItem.className  = "collection-item"
  listItem.innerText = `Date:${date}\nCenter:${center}\nSlots remaining: ${available_capacity}\nCan you book now: ${slots.length==0?'No':'Yes'}\nMin Age: ${age}`;
  target.appendChild(listItem);
  

}

function filter(){
    const results = window.results;
    const fil = document.getElementById('filter').checked;
    console.log(fil)
    while (document.getElementById('target').hasChildNodes()) {  
        document.getElementById('target').removeChild(document.getElementById('target').firstChild);
      }
    for(let res of results){
        for(let r of res){
        render(r['date'],r['center'],r['available_capacity'],r['slots'],r['age'],fil)
    }
}
}

async function load(pincode,date){
    let res =  await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${date}`);
    res = await res.json();
    const result = [];
    for(let center of res['centers']){
        let sessions = center['sessions'];
        for(let session of sessions){
            if(session['available_capacity']>0){
                let _result = {
                    center:center['address'],
                    date:session['date'],
                    available_capacity:session['available_capacity'],
                    slots:session['slots'],
                    age:session['min_age_limit']
                }
                result.push(_result);
            }
        }
    }
    return result;
}

function cleanUp(result){
    if(result==0){
        document.getElementById('loading').style.display = "block"
        document.getElementById('loading').innerText = "No Slots Available";
        while (document.getElementById('target').hasChildNodes()) {  
            document.getElementById('target').removeChild(document.getElementById('target').firstChild);
          }
    }
    else{
        document.getElementById('loading').style.display = 'none'; 
    }
    
   
}

function getValues(e){
    e.preventDefault();
    // const date = String(document.getElementById('date').value).split('-').reverse().join('-');
    const pincode = document.getElementById('pincode').value;
    
    while (document.getElementById('target').hasChildNodes()) {  
        document.getElementById('target').removeChild(document.getElementById('target').firstChild);
      }
    document.getElementById('loading').innerText = "Loading...";
    document.getElementById('loading').style.display = "block";

    load(pincode,date);
}