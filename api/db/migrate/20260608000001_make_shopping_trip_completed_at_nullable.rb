class MakeShoppingTripCompletedAtNullable < ActiveRecord::Migration[8.1]
  def change
    change_column_null :shopping_trips, :completed_at, true
  end
end
