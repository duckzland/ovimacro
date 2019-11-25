
var Started  = false;
var Turning  = false;
var Feeding  = false;
var Hatching = false;
var Timer    = false;
var Delay    = 1000;
var State    = '';
var Counter  = 0;
var Friends  = [];

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
                ScanFriends(TurnEgg);
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


function goToMyPage() {
    $('#header #self .avatar img').click();
}


function goToHatchery() {
    $('#menu li .hatchery a span').click();
}


function goToFriend(n = 0) {
    //$('#sub_feed #user .friends ul li img').eq(n).click();
    var url = Friends[n];
    if (url) {
        window.location = url;   
    }
}


function goToPetPage() {
    $('#menu li .pets a span').click();
}


function goToPetTab(n = 0) {
    $('#src_pets #sub_overview #enclosures .ui-sortable li a').eq(n).click();
}


function hasFriend(n = 0) {
    //return $('#sub_feed #user .friends ul li img').eq(n).length > 0;    
    return typeof Friends[n] !== 'undefined';
}


function hasPetTab(n = 0) {
    return $('#src_pets #sub_overview #enclosures .ui-sortable li a').eq(n).length > 0;
}


function isPetTabActive(n = 0) {
    return $('#src_pets #sub_overview #enclosures .ui-sortable li').eq(n).hasClass('ui-tabs-active');
}


function ScanFriends(callFunc = false) {   
    // Move to the user page
    if ($('button[onclick*=fbinvite]').length === 0) {
        goToMyPage();    
        clearTimeout(Timer);
        Timer = setTimeout(function() {
            ScanFriends();
        }, 1000);
    }
    
    // Open friends list
    else if ($('#overlay .friends a.user.avatar').length === 0) {
        $('fieldset.friends').find('button').click();
        clearTimeout(Timer);
        Timer = setTimeout(function() {
            ScanFriends();
        }, 1000);
    }
    
    // Scan all friends and store their profile url then boot the callback function
    else {
        Friends  = [];
        $('#overlay .friends a.user.avatar').each(function() {
            Friends.push($(this).attr('href'));
        });
        $('#overlay').hide();
        callFunc && callFunc();
    }
}


function TurnEgg() {
    var Hatchery = $('#hatchery');
    var Profile = $('#profile');
    var FriendPage = $('button[onclick*=edit_friendship]');
    var SelfPage = $('button[onclick*=fbinvite]');                   
    var Next = Profile.find('a[title="Next"]');
    var Turn = Profile.find('button[onclick*=turn_egg]');
    var Dialog = $('.ui-dialog-buttonpane').find('button');
    
    RunningIndicator();
   
    // We are on our own front page
    if (SelfPage.length !== 0) {        
        if (hasFriend(Counter)) {
            goToFriend(Counter);
            Counter++;
        }
        else {
            StopOperations();
        }
    }
    
    // We are on the friend frontpage
    else if (FriendPage.length !== 0) {
        goToHatchery();
    }
             
    // We are on the hatchery page
    else if (Hatchery.length !== 0) {
        Timer && clearTimeout(Timer);
        Timer = setTimeout(function () {
            var TurnIcon = Hatchery.find('img[title="Turn Egg"]');
            
            // Got pet to turn
            if (TurnIcon.length > 0) {
                TurnIcon.eq(0).parent().parent().children('a').children('img').click();
                State = 'check_egg';
            }

            // No pet to turn exiting macro
            else {
                goToMyPage();
            }
        }, Delay);
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
            goToHatchery();
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
    var Hatchery = $('#hatchery');
    var Profile = $('#profile');
    var SelfPage = $('button[onclick*=fbinvite]');  
    var Hatch = $('#profile button[onclick*=pet_turn_egg]');
    var HatchIcon = Hatchery.find('img[title="Hatch Egg"]');

    RunningIndicator();

    if (SelfPage.length !== 0) {
        goToHatchery();    
    }
    
    else if (Hatchery.length !== 0) {
        // Got pet to hatch
        if (HatchIcon.length > 0) {
            HatchIcon.eq(0).parent().parent().children('a').children('img').click();
        }
        
        // No pet to turn exiting macro
        else {
            StopOperations();
        }
    }
    
    else {
        if (Hatch.length !== 0) {
            Hatch.click();
        }
        else {
            Timer && clearTimeout(Timer);
            Timer = setTimeout(function () {
                goToHatchery();
            }, Delay);
        }
    }
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

function StopOperations() {
    Turning  = false;
    Feeding  = false;
    Hatching = false;
    State    = '';
    Counter  = 0;
    clearTimeout(Timer);
    StopRunningIndicator();
}

StartMacro();
