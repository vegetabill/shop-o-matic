# Shop-o-matic

A shopping list app for households to keep track of items needed to buy.

## Tech Stack

The API backend app is powered by Ruby on Rails and a front end of a React Native app.

## Home Assistant Integration

Link your HA instance to an MQTT broker. 


### HA Automation

Add an automation to republish any shopping_list events into a topic of your choice. 

Check your DB for household_id

```json
{
  "household_id": "xxxxxx-e126-4dfb-aa3c-123456789",
  "action": "{{trigger.event.data.action}}",
  "item": "{{trigger.event.data.item.name}}"
}
```

### Rails Config

Configure the necessary MQTT* env vars.

```
MQTT_HOST: xxxx
MQTT*
```

The incoming MQTT payload you send will look like this:

```json
{ 
  "action": "add", 
  "item": "impossible burgers",
  "household_id": "xxxxxx-e126-4dfb-aa3c-123456789"
}
```

The `item` will be added in the same way it would be if typed into the mobile app and added.

Currently, only `add` is supported so you'll have to clear the list periodically.


## General Features / Setup

- You can login using your Google Account
- You can create and share lists with other members of your household
- Lists can be shared via a URL and shared any way the user wants on their phone
- You can create Stores and assign each a color
- You can create or edit Categories of where the item can be found, e.g. "Frozen" or "Produce"

## Predefined Data
- A user should start with a single store called "Grocery Store"
- A user should also start with a set of typical grocery store categories, e.g. "Snacks", "Frozen", "Dairy Case", etc.

## Household Mode

- Normally when visiting the list you start in household mode
- An autocomplete add item field will search items you have added in the past to autofill the name and other info like Category
- In household mode you can add items to the list
- For each item you can tag them with the store(s) that carry the item or (if not it will be unknown)

### List Item

This describes the item data:

- Name, e.g. carrots
- Notes, a small text field where you can put quantity or weight or other info
- Store(s), e.g. "Whole Foods" and "Rainbow" where you can find it to buy
- Timestamps of when the item was last updated and by which user
- When an item has been purchased it should not be deleted so the next time it is added it will have the same attributes


## Shopping Mode

- In shopping mode you pick what store you are shopping at
- You will see only items that are available at the current store
- For each item you can mark it as not available at the store you are in so it will disappear from the view
- For each item you can check it off as purchased which will show as crossed out
- The purchased items will stay as crossed out until you leave the view and shopping mode is over