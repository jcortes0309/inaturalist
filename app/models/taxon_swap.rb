class TaxonSwap < TaxonChange
  has_one :old_taxon, :through => :taxon_change_taxa, :source => :taxon
  
  def self.update_observations_later(taxon_change_id)
    unless taxon_swap = TaxonSwap.find_by_id(taxon_change_id)
      return
    end
    taxon_swap.update_observations
  end
  
  def update_observations
    Observation.update_all(["taxon_id = ?", taxon_id], ["taxon_id = ?", old_taxon_id])
  end
  
  def opposite_taxon_from(subject_taxon)
    if subject_taxon.id == taxon_id
      taxa.loaded? ? taxa.first : old_taxon
    else
      taxon
    end
  end
  
end
