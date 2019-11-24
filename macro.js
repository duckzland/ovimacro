
var Started  = false;
var Feeding  = false;
var Timer    = false;
var Delay    = 1000;
var State    = '';
var Counter  = 0;

var Queues   = [];
var Friends  = [];
var Eggs     = [];
var Mode     = false;
var Action   = '';

function StartMacro() {

    if (Started) return;

    Started = true;
    $(document)
        .off('ajaxComplete.ovipets_macro')
        .on('ajaxComplete.ovipets_macro', function () {
            if (Feeding) {
                FeedPets();
            }
        
            if (Array.isArray(Eggs) && Eggs.length > 0) {
                console.log('Total Eggs found', Eggs.length);
                Mode = 'ProcessEggs';   
            }
        
            else {
                if (Array.isArray(Friends) && Friends.length > 0) {
                    console.log('Total Friends found', Friends.length);
                    Mode = 'ScanEggs'; 
                    console.log('Mode set', Mode);
                }
            }
        
            console.log('Current Mode', Mode);
            switch (Mode) {
                case 'ScanFriends':
                    ScanFriends();
                    break;
                    
                case 'ScanEggs' :
                    ScanEggs();
                    break;
                    
                case 'ProcessEggs':
                    ProcessEggs();
                    break;
                    
                case 'StartQueue':
                    StartQueue();
                    break;
            }
        })
        .off('keypress.ovipets_macro')
        .on('keypress.ovipets_macro', function (e) {

            // Number 1 pressed
            if (e.keyCode === 49) {
                Action = 'TurnEgg';
                Mode = false;
                Queues = [
                    StartQueue,
                    ScanFriends,
                    ScanEggs,
                    ProcessEggs,
                    StopOperations
                ];
                callNextQueue();
            }
            // Number 2 pressed
            else if (e.keyCode === 50) {
                Feeding = true;
                FeedPets();
            }
        
            // Number 3 pressed
            else if (e.keyCode === 51) {
                Action = 'HatchEgg';
                Queues = [
                    StartQueue,
                    ScanEggs,
                    ProcessEggs,
                    StopOperations
                ];
                callNextQueue();
            }

            // Number 4 pressed
            else if (e.keyCode === 52) {
                StopOperations();
            }
        });
}


function RunningIndicator() {
    $('body').css('background-color', '#123123');
}


function StopRunningIndicator() {
    $('body').css('background-color', '#ffffff');
}


function goToMyPage() {
    $('#header #self .avatar img').click();
}


function goToHatchery() {
    $('#menu li .hatchery a span').click();
}


function goToFriend(n = 0) {
    $('#sub_feed #user .friends ul li img').eq(n).click();
}


function goToPetPage() {
    $('#menu li .pets a span').click();
}


function goToPetTab(n = 0) {
    $('#src_pets #sub_overview #enclosures .ui-sortable li a').eq(n).click();
}


function hasFriend(n = 0) {
    return $('#sub_feed #user .friends ul li img').eq(n).length > 0;    
}


function hasPetTab(n = 0) {
    return $('#src_pets #sub_overview #enclosures .ui-sortable li a').eq(n).length > 0;
}


function isPetTabActive(n = 0) {
    return $('#src_pets #sub_overview #enclosures .ui-sortable li').eq(n).hasClass('ui-tabs-active');
}


function FeedPets() {
    var Profile = $('#profile');
    var SelfPage = $('button[onclick*=fbinvite]');  
    var PetPage = $('#src_pets #sub_overview #enclosures');
    var Next = $('#profile a[title="Next"]');
    var Feed = $('#profile button[onclick*=pet_feed]');

    RunningIndicator();

    if (SelfPage.length !== 0) {
        goToPetPage();
    }
    
    else if (PetPage.length !== 0) {
        if (hasPetTab(Counter)) {
            goToPetTab(Counter);
        }
        else {
            StopOperations();
        }
        
        if (isPetTabActive(Counter) && State <= 0) {
            Timer && clearTimeout(Timer);
            Timer = setTimeout(function() {
                var Pets = $('#src_pets #sub_overview #enclosures .ui-section li:visible');
                State = Pets.length;
                Pets.eq(0).find('a.pet img').click();
            }, 50);
        }
    }   
    else {        
        if (State > 0 ) {
            if (Feed.length !== 0) {
                Feed.click();
            }
            else if (Next.length !== 0) {
                Timer && clearTimeout(Timer);
                Timer = setTimeout(function() {
                    Next.click();
                    State--;
                }, Delay);
            }
        }
        else {
            Timer && clearTimeout(Timer);
            Timer = setTimeout(function() {
                Counter++;
                goToPetPage();
            }, Delay);
        }
    }
}

function resetMode(callback = false) {
    clearTimeout(Timer);
    Timer = setTimeout(function() {
        Mode = false;   
        callback && callback();
    }, 1);
}

function resetAction() {
    Action = '';
}

function callNextQueue() {
    setTimeout(function() {
        var nextFunc = Queues.shift();
        nextFunc && nextFunc();
    }, 300);
}

function StartQueue() {
    clearTimeout(Timer);
    Timer = setTimeout(function() {
        Mode = 'StartQueue';
        RunningIndicator();
        var url = '';
        switch (Action) {
            case 'TurnEgg':
                url = $('#header #self .avatar').attr('href')
                break;
                
            case 'HatchEgg':
                Mode = 'ScanEggs';
                url = '#!/?src=pets&sub=hatchery';
                break;
        }

        if (String(window.location.hash) !==  String(url)) {
            window.location = url;
        }
        else {
            resetMode(callNextQueue);
        } 
    }, 10);
}


function ScanFriends() {
    clearTimeout(Timer);
    Timer = setTimeout(function() {
        Mode = 'ScanFriends';
        
        var Targets = $('#overlay .friends a.user.avatar');
        var Button = $('fieldset.friends').find('button');    
        
        if (!Targets.length) {
            $('fieldset.friends').find('button').click();
            ScanFriends();
        }
        else {
            Targets.each(function() {
                Friends.push($(this).attr('href'));
            });
            resetMode(callNextQueue);
        }
        
        console.log('Scanning Friends', Friends);
        
    }, 1500);
}

function ScanEggs() { 
    clearTimeout(Timer);
    Timer = setTimeout(function() {
        Mode = 'ScanEggs';
        
        var type = (Action === 'TurnEgg') ? 'Turn Egg' : 'Hatch Egg';
        var Targets = $('#hatchery').find('img[title="' + type + '"]');

        if (Targets.length) {
            Targets.each(function() {
                Eggs.push($(this).parent().parent().children('a').attr('href'));
            });
        }

        if (Array.isArray(Friends) && Friends.length) {
            window.location = Friends.pop().replace('#!/?', '#!/?src=pets&sub=hatchery&');
        }
        //else {
        //    resetMode(callNextQueue);
        //}
        
        console.log('Scanning Eggs', Eggs);
        
    }, 2100);    
}

function ProcessEggs() {
    clearTimeout(Timer);
    Timer = setTimeout(function() {
        Mode = 'ProcessEggs';
        
        var type = (Action === 'TurnEgg') ? 'pet_turn_egg' : 'turn_egg';
 
        console.log('Remaining Eggs', Eggs.length);
        
        if ($('#profile form .actions').find('button[onclick*=' + type + ']').length) {
            console.log('Clicking Button');
            $('#profile form .actions').find('button[onclick*=' + type + ']').click();
            return;
        }
        else if ($('.ui-dialog-buttonpane').find('button').length) {
            console.log('Clicking Dialog');
            $('.ui-dialog-buttonpane').find('button').click();
            // Dialog closing will not invoke ajaxComplete thus breaking the chain process.
            // Reinvoke the function to move to the next step
            ProcessEggs();
            return;
        }
        
        else if (Array.isArray(Eggs) && Eggs.length > 0) {
            var url = Eggs.shift();
            window.location = url;
            return;
        }
        
        console.log('Processing Eggs', Eggs);
        
    }, 2500);
}


function StopOperations() {
    console.log('Stopping Operations');
    Feeding  = false;
    State    = '';
    Counter  = 0;
    
    Queues   = [];
    Friends  = [];
    Eggs     = [];
    Mode     = false;
    Action   = '';
    
    clearTimeout(Timer);
    StopRunningIndicator();

    window.location = $('#header #self .avatar').attr('href');
}

StartMacro();
