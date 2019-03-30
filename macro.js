
var Started = false;
var Turning = false;
var Feeding = false;
var Timer   = false;
var Delay   = 1000;

function StartMacro() {

    if (Started) return;

    Started = true;
    $(document)
        .off('ajaxComplete.ovipets_macro')
        .on('ajaxComplete.ovipets_macro', function () {
            if (Turning) {
                TurnEgg();
            }

            else if (Feeding) {
                FeedPets();
            }
        })
        .off('keypress.ovipets_macro')
        .on('keypress.ovipets_macro', function (e) {

            // Number 1 pressed
            if (e.keyCode === 49) {
                TurnEgg();
            }
            // Number 2 pressed
            else if (e.keyCode === 50) {
                FeedPets();
            }

            // Number 3 pressed
            else if (e.keyCode === 51) {
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
    var Next = $('#profile a[title="Next"]');
    var Turn = $('#profile button[onclick*=turn_egg]');
    var Dialog = $('.ui-dialog-buttonpane').find('button');

    RunningIndicator();

    if (Dialog.length !== 0) {
        Dialog.click();
    }

    if (Turn.length !== 0) {
        Turn.click();
    }

    else if (Next.length !== 0) {
        Timer && clearTimeout(Timer);
        Timer = setTimeout(function () {
            Next.click();
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
    Turning = false;
    Feeding = false;
    clearTimeout(Timer);
    StopRunningIndicator();
}

StartMacro();
