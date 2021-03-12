import { runAppleScriptAsync } from 'run-applescript';

const ZoomCommands = {
  MUTE: 'Mute Audio',
  UNMUTE: 'Unmute Audio'
};

const ZoomState = {
  MUTED: Symbol('muted'),
  UNMUTED: Symbol('unmuted'),
  UNKNOWN: Symbol('unknown')
};

const muteUnmuteScript = (command) => `
-- Function definitions
-- https://hints.macworld.com/article.php?story=20060921045743404

on menu_click(mList)
    local appName, topMenu, r
    
    -- Validate our input
    if mList's length < 3 then error "Menu list is not long enough"
    
    -- Set these variables for clarity and brevity later on
    set {appName, topMenu} to (items 1 through 2 of mList)
    set r to (items 3 through (mList's length) of mList)
    
    -- This overly-long line calls the menu_recurse function with
    -- two arguments: r, and a reference to the top-level menu
    tell application "System Events" to my menu_click_recurse(r, ((process appName)'s ¬
        (menu bar 1)'s (menu bar item topMenu)'s (menu topMenu)))
end menu_click

on menu_click_recurse(mList, parentObject)
    local f, r
    
    -- 'f' = first item, 'r' = rest of items
    set f to item 1 of mList
    if mList's length > 1 then set r to (items 2 through (mList's length) of mList)
    
    -- either actually click the menu item, or recurse again
    tell application "System Events"
        if mList's length is 1 then
            click parentObject's menu item f
        else
            my menu_click_recurse(r, (parentObject's (menu item f)'s (menu f)))
        end if
    end tell
end menu_click_recurse

-- Actual code

set zoom to "zoom.us"
tell application zoom to activate
menu_click({zoom, "Meeting", "${command}"})
`;

const isMutedScript = () => `
-- Function definitions

on menu_exists(mList)
  local appName, topMenu, r
  
  -- Validate our input
  if mList's length < 3 then error "Menu list is not long enough"
  
  -- Set these variables for clarity and brevity later on
  set {appName, topMenu} to (items 1 through 2 of mList)
  set r to (items 3 through (mList's length) of mList)
  
  -- This overly-long line calls the menu_recurse function with
  -- two arguments: r, and a reference to the top-level menu
  tell application "System Events" to my menu_exists_recurse(r, ((process appName)'s ¬
    (menu bar 1)'s (menu bar item topMenu)'s (menu topMenu)))
end menu_exists

on menu_exists_recurse(mList, parentObject)
  local f, r
  -- 'f' = first item, 'r' = rest of items
  set f to item 1 of mList
  if mList's length > 1 then set r to (items 2 through (mList's length) of mList)
  
  -- either actually click the menu item, or recurse again
  tell application "System Events"
    if mList's length is 1 then
      if parentObject's menu item f exists then
        return 1
      else
        return 0
      end if
    else
      my menu_exists_recurse(r, (parentObject's (menu item f)'s (menu f)))
    end if
  end tell
end menu_exists_recurse

-- Actual code

-- We don't need to activate it, the script can check the presence
-- of the menu item anyways
set zoom to "zoom.us"
menu_exists({zoom, "Meeting", "${ZoomCommands.UNMUTE}"})
`;

async function mute () {
  let result = false;
  try {
    result = await runAppleScriptAsync(muteUnmuteScript(ZoomCommands.MUTE));
  } catch {
    return false;
  }
  return result;
}

async function unmute () {
  let result = false;
  try {
    result = await runAppleScriptAsync(muteUnmuteScript(ZoomCommands.UNMUTE));
  } catch {
    return false;
  }
  return result;
}

async function isMuted () {
  let result = ZoomState.UNKNOWN;
  try {
    result = parseInt(await runAppleScriptAsync(isMutedScript()), 10) ? ZoomState.MUTED : ZoomState.UNMUTED;
  } catch {}
  return result;
}

const Zoom = { mute, unmute, isMuted };

export { Zoom, ZoomState };
