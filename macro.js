
var Started  = false;
var Turning  = false;
var Feeding  = false;
var Hatching = false;
var Timer    = false;
var Delay    = 1000;
var State    = '';

function StartMacro() {

    if (Started) return;

    Started = true;
    $(document)
        .off('ajaxComplete.ovipets_macro')
        .on('ajaxComplete.ovipets_macro', function () {
            if (Turning) {
                TurnEgg();
            }
            else if (Hatching) {
                HatchPets();    
            }
            else if (Feeding) {
                FeedPets();
            }
        })
        .off('keypress.ovipets_macro')
        .on('keypress.ovipets_macro', function (e) {

            // Number 1 pressed
            if (e.keyCode === 49) {
                Turning = true;
                TurnEgg();
            }
            // Number 2 pressed
            else if (e.keyCode === 50) {
                Feeding = true;
                FeedPets();
            }
        
            // Number 3 pressed
            else if (e.keyCode === 51) {
                Hatching = true;
                HatchPets();
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


function TurnEgg() {
    var Hatchery = $('#hatchery');
    var Profile = $('#profile');
    var Next = Profile.find('a[title="Next"]');
    var Turn = Profile.find('button[onclick*=turn_egg]');
    var Dialog = $('.ui-dialog-buttonpane').find('button');
    var TurnIcon = Hatchery.find('img[title="Turn Egg"]');
    var Reset = $('#menu li .hatchery a span');
    
    RunningIndicator();
    
    // We are on the hatchery page
    if (Hatchery.length !== 0) {
        
        // Got pet to turn
        if (TurnIcon.length > 0) {
            TurnIcon.eq(0).parent().parent().children('a').children('img').click();
            State = 'check_egg';
        }
        
        // No pet to turn exiting macro
        else {
            StopOperations();        
        }
    }
    
    // We are on the profile page
    else {
        if (Dialog.length !== 0) {
            Dialog.click();
        }

        if (Turn.length !== 0) {
            Turn.click();
            State = 'next_page';
        }
        
        else if (State === 'check_egg' && Turn.length === 0) {
            Reset.click();
        }
        
        else if (Next.length !== 0) {
            Timer && clearTimeout(Timer);
            Timer = setTimeout(function () {
                State = 'check_egg';
                Next.click();            
            }, Delay);
        }
    }
}


function HatchPets() {
    
    var Pet = $('input[name="PetID[]"]').eq(0);
    var Hatch = $('#profile button[onclick*=hatch_egg]');
    var Reset = $('#menu li .hatchery a span');

    RunningIndicator();

    if (Pet.length !== 0) {
        Pet.click();
    }
    else if (Hatch.length !== 0) {
        Hatch.click();
    }
    else if (Reset.length !== 0) {
        Timer && clearTimeout(Timer);
        Timer = setTimeout(function () {
            Reset.click();
        }, Delay);
    }
}


function FeedPets() {
    var Next = $('#profile a[title="Next"]');
    var Feed = $('#profile button[onclick*=pet_feed]');

    RunningIndicator();

    if (Feed.length !== 0) {
        Feed.click();
    }
    else if (Next.length !== 0) {
        Timer && clearTimeout(Timer);
        Timer = setTimeout(function() {
            Next.click();
        }, Delay);
    }
}

function StopOperations() {
    Turning  = false;
    Feeding  = false;
    Hatching = false;
    State    = '';
    clearTimeout(Timer);
    StopRunningIndicator();
}

StartMacro();
