# In a CeleryScript flat IR tree, primitive values are stored as edge nodes.
# Canonical representation:
#  `args: {speed: 100}`
# IR representation:
#   `{sequence_id: 6, primary_node_id: 7 kind: "speed" value: "100"}`
class EdgeNode < ApplicationRecord
  belongs_to            :primary_node
  belongs_to            :sequence
  serialize             :value, JSON
  validates_presence_of :sequence

  def broadcast?
    false
  end
end
