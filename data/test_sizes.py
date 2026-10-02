"""Run:  python3 data/test_sizes.py   (cases are real names from supplier-catalogue.xlsx)"""
import unittest

from sizes import split_sized


class SplitSized(unittest.TestCase):
    def check(self, name, base, label):
        self.assertEqual(split_sized(name), (base, label), name)

    def test_sizes_in_the_middle_and_at_the_end(self):
        self.check('Pu Hose Fitting Elbow 6mm 1/2" M', "Pu Hose Fitting Elbow", '6mm 1/2" M')
        self.check("Pu Hose Fitting Straight Stud 10mm-1/2 F", "Pu Hose Fitting Straight Stud", "10mm-1/2 F")
        self.check('Pu Hose Fitting Tee 10mm X 1/2"f X 1/2"m', "Pu Hose Fitting Tee", '10mm X 1/2"f X 1/2"m')
        self.check("Elbow 12mm-1/4 M Pu Hose Fitting", "Elbow Pu Hose Fitting", "12mm-1/4 M")

    def test_gender_and_pack_words(self):
        self.check("Nipple Brass 3/8x3/8 M/m 1pc Pack", "Nipple Brass", "3/8x3/8 M/m 1pc Pack")
        self.check("Reducer Brass 1/2x1/4 M/f Conical", "Reducer Brass Conical", "1/2x1/4 M/f")
        self.check("Connector German 6mm Hosetail Bulk", "Connector German Hosetail", "6mm Bulk")
        self.check("Ptfe Tape 19mmx0.075mmx10m Roll Bulk", "Ptfe Tape", "19mmx0.075mmx10m Roll Bulk")

    def test_leading_sizes(self):
        self.check("10mm Combination Spanner", "Combination Spanner", "10mm")
        self.check("3x100mm Screwdriver with Soft Handle", "Screwdriver with Soft Handle", "3x100mm")
        self.check("PH0X100mm Philips Type Screwdriver Classic", "Philips Type Screwdriver Classic", "PH0X100mm")
        self.check("14lb (6.4kg) Sledge Hammer Fibreglass Handle", "Sledge Hammer Fibreglass Handle", "14lb (6.4kg)")
        self.check('7\'\' (175mm) Gauging Bricklaying Trowel', "Gauging Bricklaying Trowel", "7'' (175mm)")
        self.check('4" X 10 Piece Paint Roller Cover', "Paint Roller Cover", '4" X 10 Piece')
        self.check("3 Piece Orange Circular Handle Wood Chisel Set", "Orange Circular Handle Wood Chisel Set", "3 Piece")

    def test_brackets(self):
        self.check('Filter / Regulator / Lubricator 1/2" With Auto Drain (hec4010-04d)',
                   "Filter / Regulator / Lubricator With Auto Drain", '1/2" (hec4010-04d)')
        self.check("Polyurethane Hose Blue 10mm O.d. Per Metre (100m Roll)",
                   "Polyurethane Hose Blue O.d. Per Metre", "10mm (100m Roll)")
        # a finish in brackets is not a size
        self.check("STRAIGHT S65 (Chrome)", "STRAIGHT S65 (Chrome)", "")

    def test_ranges(self):
        self.check('Press. Gauge 40mm 1/4" Rear Fit 0-16bar 0-1600kpa', "Press. Gauge Rear Fit", '40mm 1/4" 0-16bar 0-1600kpa')

    def test_numbers_that_are_not_sizes_stay(self):
        self.check("Pu Hose Fitting 4 Way Connector 6mm", "Pu Hose Fitting 4 Way Connector", "6mm")
        self.check("Press. Gauge Type 140 Staple", "Press. Gauge Type 140 Staple", "")

    def test_model_codes_are_not_sizes(self):
        self.check("Spray Gun Hvlp Sg-mp200 Suction Cup", "Spray Gun Hvlp Sg-mp200 Suction Cup", "")
        self.check("Bevel Pinion Gear For At0025", "Bevel Pinion Gear For At0025", "")

    def test_nothing_to_split_returns_the_name(self):
        self.check("Stainless Spade", "Stainless Spade", "")
        self.check("Lubricator", "Lubricator", "")

    def test_pack_and_inch_spellings_seen_in_the_data(self):
        self.check("4 Way Hose Connector 1pce", "4 Way Hose Connector", "1pce")
        self.check("Connector Hosetail 2pack", "Connector Hosetail", "2pack")
        self.check("Hosetails 1/4' m", "Hosetails", "1/4' m")
        self.check('Hosetail 1/4"f x 10mm 2pc pack', "Hosetail", '1/4"f x 10mm 2pc pack')

    def test_a_name_with_nothing_but_sizes_is_left_alone(self):
        self.check("12mm", "12mm", "")
        self.check("6 X 8mm", "6 X 8mm", "")


if __name__ == "__main__":
    unittest.main()
