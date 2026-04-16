# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2024_01_01_000007) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "household_id", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["household_id", "name"], name: "index_categories_on_household_id_and_name", unique: true
    t.index ["household_id"], name: "index_categories_on_household_id"
  end

  create_table "household_memberships", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "household_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["household_id"], name: "index_household_memberships_on_household_id"
    t.index ["user_id", "household_id"], name: "index_household_memberships_on_user_id_and_household_id", unique: true
    t.index ["user_id"], name: "index_household_memberships_on_user_id"
  end

  create_table "households", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "share_token", null: false
    t.datetime "updated_at", null: false
    t.index ["share_token"], name: "index_households_on_share_token", unique: true
  end

  create_table "item_stores", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "item_id", null: false
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.index ["item_id", "store_id"], name: "index_item_stores_on_item_id_and_store_id", unique: true
    t.index ["item_id"], name: "index_item_stores_on_item_id"
    t.index ["store_id"], name: "index_item_stores_on_store_id"
  end

  create_table "items", force: :cascade do |t|
    t.bigint "added_by_user_id"
    t.bigint "category_id"
    t.datetime "created_at", null: false
    t.bigint "household_id", null: false
    t.string "name", null: false
    t.text "notes"
    t.boolean "on_list", default: false, null: false
    t.datetime "purchased_at"
    t.datetime "updated_at", null: false
    t.bigint "updated_by_user_id"
    t.index ["category_id"], name: "index_items_on_category_id"
    t.index ["household_id", "on_list"], name: "index_items_on_household_id_and_on_list"
    t.index ["household_id"], name: "index_items_on_household_id"
    t.index ["purchased_at"], name: "index_items_on_purchased_at"
  end

  create_table "stores", force: :cascade do |t|
    t.string "color", default: "#4CAF50", null: false
    t.datetime "created_at", null: false
    t.bigint "household_id", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["household_id", "name"], name: "index_stores_on_household_id_and_name", unique: true
    t.index ["household_id"], name: "index_stores_on_household_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "google_avatar_url"
    t.string "google_uid", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["google_uid"], name: "index_users_on_google_uid", unique: true
  end

  add_foreign_key "categories", "households"
  add_foreign_key "household_memberships", "households"
  add_foreign_key "household_memberships", "users"
  add_foreign_key "item_stores", "items"
  add_foreign_key "item_stores", "stores"
  add_foreign_key "items", "categories"
  add_foreign_key "items", "households"
  add_foreign_key "items", "users", column: "added_by_user_id"
  add_foreign_key "items", "users", column: "updated_by_user_id"
  add_foreign_key "stores", "households"
end
