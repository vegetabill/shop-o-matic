class FixShoppingTripsStoreFkOnDelete < ActiveRecord::Migration[8.0]
  def up
    remove_foreign_key :shopping_trips, :stores
    add_foreign_key :shopping_trips, :stores, on_delete: :nullify
  end

  def down
    remove_foreign_key :shopping_trips, :stores
    add_foreign_key :shopping_trips, :stores
  end
end
