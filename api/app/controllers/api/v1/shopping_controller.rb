module Api
  module V1
    class ShoppingController < ApplicationController
      # POST /api/v1/households/:household_id/shopping/end
      # Ends shopping mode: all purchased items get on_list=false, purchased_at=nil
      def end
        purchased_items = current_household.items.where.not(purchased_at: nil)
        count = purchased_items.count

        purchased_items.update_all(on_list: false, purchased_at: nil, updated_at: Time.current)

        render json: {
          message: "Shopping mode ended",
          items_cleared: count
        }, status: :ok
      end
    end
  end
end
