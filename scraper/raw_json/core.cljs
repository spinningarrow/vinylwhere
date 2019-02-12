(ns raw-json.core
  (:require [planck.core :refer [slurp *in*]]
            [clojure.string :as string :refer [split trim]]))
            ;; [raw-json.vinylrecords :as thing]))

(def s "raw-json.vinylrecords")
;; (require '[(symbol s) :as thing])
(require `(symbol s))

(def in (-> *in*
            slurp
            JSON.parse
            (js->clj :keywordize-keys true)))

(defn link->record
  [{href :href text :text} link]
  (let [[artist album] (split text thing/artist-album-split)]
    {:href (thing/transform-href href)
     :artist (trim (thing/transform-artist artist))
     :album (trim (thing/transform-album album))
     :meta []}))

(print (->> in
            (map link->record)
            clj->js
            JSON.stringify))
