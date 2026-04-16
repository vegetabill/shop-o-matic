# db/seeds.rb
# This file is for development/demo seeding.
# The actual default household data seeding happens in Household#seed_defaults!

puts "Seeding development data..."

if Rails.env.development?
  # Create a demo user
  user = User.find_or_create_by!(google_uid: "demo_google_uid_123") do |u|
    u.email = "demo@example.com"
    u.name = "Demo User"
    u.google_avatar_url = nil
  end
  puts "  Created user: #{user.email}"

  # Create a demo household
  household = Household.find_or_create_by!(name: "Demo Household") do |h|
    # share_token auto-generated
  end

  unless household.users.include?(user)
    household.household_memberships.create!(user: user)
  end

  household.seed_defaults!
  puts "  Created household: #{household.name} (share_token: #{household.share_token})"

  # Add some demo items
  grocery_store = household.stores.find_by(name: "Grocery Store")
  produce_category = household.categories.find_by(name: "Produce")
  dairy_category = household.categories.find_by(name: "Dairy Case")

  demo_items = [
    { name: "Apples", category: produce_category, on_list: true },
    { name: "Bananas", category: produce_category, on_list: true },
    { name: "Milk (2%)", category: dairy_category, on_list: true },
    { name: "Cheddar Cheese", category: dairy_category, on_list: false },
    { name: "Bread", category: household.categories.find_by(name: "Bakery"), on_list: true }
  ]

  demo_items.each do |attrs|
    item = household.items.find_or_create_by!(name: attrs[:name]) do |i|
      i.category = attrs[:category]
      i.on_list = attrs[:on_list]
      i.added_by_user = user
      i.updated_by_user = user
    end
    item.item_stores.find_or_create_by!(store: grocery_store) if grocery_store
    puts "  Created item: #{item.name}"
  end

  puts ""
  puts "Done! Demo JWT for testing:"
  puts JwtService.token_for_user(user)
end
