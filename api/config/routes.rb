Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth
      post "auth/google", to: "auth#google"
      post "auth/mock", to: "auth#mock" if Rails.env.development?

      # Households
      resources :households, only: [:index, :create, :show] do
        collection do
          post :join
        end

        # Stores nested under household
        resources :stores, only: [:index, :create, :update, :destroy]

        # Categories nested under household
        resources :categories, only: [:index, :create, :update, :destroy]

        # Items nested under household
        resources :items, only: [:index, :create, :update] do
          member do
            post :add_to_list
            post :purchase
            post :unpurchase
            post :mark_unavailable
          end
        end

        # Shopping mode
        post "shopping/end", to: "shopping#end"
      end
    end
  end

  # Health check
  get "/health", to: proc { [200, {}, [{ status: "ok" }.to_json]] }
end
