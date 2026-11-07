# Shop-o-matic

A shopping list app for households to keep track of items needed to buy.

## Tech Stack

The API backend app is powered by Ruby on Rails and a front end of a React Native app.

## Home Assistant Integration

Link your HA instance to an MQTT broker. 


### HA Automation

Add an automation to republish any shopping_list events into a topic of your choice. 

Set `household_id` to the household's 6-character join code (the same code used to invite members), not its database ID.

```json
{
  "household_id": "ABC123",
  "action": "{{trigger.event.data.action}}",
  "item": "{{trigger.event.data.item.name}}"
}
```

### Rails Config

Configure the MQTT env vars. The listener is disabled unless `MQTT_HOST` is set.

```
MQTT_HOST: your-broker.local
MQTT_PORT: 1883                # optional, defaults to 1883
MQTT_TOPIC: shop-o-matic/#     # optional, defaults to shop-o-matic/#
MQTT_USERNAME: xxxx            # optional
MQTT_PASSWORD: xxxx            # optional
```

The incoming MQTT payload you send will look like this:

```json
{ 
  "action": "add", 
  "item": "impossible burgers",
  "household_id": "ABC123"
}
```

The `item` will be added in the same way it would be if typed into the mobile app and added.

Currently, only `add` is supported so you'll have to clear the list periodically.


## General Features / Setup

- You log in through Auth0; the available login providers are configured in the Auth0 tenant
- You can create and share lists with other members of your household
- Households are shared with a 6-character join code, sent any way the user wants through the phone's native share sheet
- The share message also includes an invite URL; to join, enter the code or paste the URL into Join with Code
- You can create Stores and assign each a color
- You can create or edit Categories of where the item can be found, e.g. "Frozen" or "Produce"
- You can sign out from the household screen
- The household screen shows a connection error when the server is unreachable
- The privacy policy is available at `/privacy`

## Predefined Data
- Each new household should start with a single store called "Grocery Store"
- Each new household should also start with a set of typical grocery store categories, e.g. "Snacks", "Frozen", "Dairy Case", etc.

## Admin Portal

- A web interface at `/admin` lets admins manage users and households
- Users have a role of `normal` or `admin`; only `admin` users can sign in to the portal
- Admins sign in through Auth0
- Admins can create, edit, and delete users and households, and add or remove household members

## Household Mode

- Normally when visiting the list you start in household mode
- An autocomplete add item field will search items you have added in the past to autofill the name and other info like Category
- In household mode you can add items to the list
- For each item you can tag them with the store(s) that carry the item or (if not it will be unknown)
- Items are grouped by Category, and within each Category sorted by priority: Need Now, then no priority, then On Sale
- Priority is shown as a colored bar on the item row, and On Sale items use a de-emphasized font
- Store tags are not shown on the list; they are visible when editing an item

### List Item

This describes the item data:

- Name, e.g. carrots
- Notes, a small text field where you can put quantity or weight or other info
- Category, e.g. "Produce"
- Priority: None, On Sale, or Need Now
- Store(s), e.g. "Whole Foods" and "Rainbow" where you can find it to buy
- Timestamps of when the item was last updated and by which user
- When and where it was last purchased, shown when editing the item
- When an item has been purchased it should not be deleted so the next time it is added it will have the same attributes


## Shopping Mode

- In shopping mode you pick what store you are shopping at
- You will see items tagged for the current store, plus items with no store tags
- For each item you can long press to mark it as not available at the store you are in, which hides it for that trip and leaves it on the list
- For each item you can check it off as purchased which will show as crossed out
- The purchased items will stay as crossed out until you tap Done Shopping, which ends the trip and takes purchased items off the list

### Pausing and Resuming Shopping Mode

Your selections are saved automatically as you shop, so if you leave the shopping screen the trip stays paused. Saved selections are not finalized until you tap Done Shopping.

When you click Start Shopping it will show any in-progress shopping trips and let you resume them.