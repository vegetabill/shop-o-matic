module Api
  module V1
    class ShoppingController < ApplicationController
      # POST /api/v1/households/:household_id/shopping/end
      # Ends shopping mode: checked-off items get on_list=false so they move to history
      def end
        purchased_item_ids = Array(params[:purchased_item_ids])

        if purchased_item_ids.any?
          current_household.items
            .where(id: purchased_item_ids)
            .update_all(on_list: false, purchased_at: nil, updated_at: Time.current)
        end

        render json: { message: "Shopping mode ended" }, status: :ok
      end
    end
  end
end
