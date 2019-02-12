(ns raw-json.vinylrecords
  (:require [clojure.string :as string]))

(def artist-album-split #"–")

(def transform-href identity)

(defn transform-artist
  [artist]
  (string/replace artist "\u200e" ""))

(defn transform-album
  [album]
  (string/replace album "\u200e" ""))
