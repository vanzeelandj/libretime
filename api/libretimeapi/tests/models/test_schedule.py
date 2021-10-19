from datetime import datetime, timedelta

from django.test import TestCase

from libretimeapi.models import Schedule, ShowInstance


class TestSchedule(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.show_instance = ShowInstance(
            created=datetime(year=2021, month=10, day=1, hour=12),
            starts=datetime(year=2021, month=10, day=2, hour=1),
            ends=datetime(year=2021, month=10, day=2, hour=2),
        )
        cls.length = timedelta(minutes=10)
        cls.cue_in = timedelta(seconds=1)
        cls.cue_out = cls.length - timedelta(seconds=4)

    def create_schedule(self, starts):
        return Schedule(
            starts=starts,
            ends=starts + self.length,
            cue_in=self.cue_in,
            cue_out=self.cue_out,
            instance=self.show_instance,
        )

    def test_get_cueout(self):
        # No overlapping schedule datetimes, normal usecase:
        s1_starts = datetime(year=2021, month=10, day=2, hour=1, minute=30)
        s1 = self.create_schedule(s1_starts)
        self.assertEqual(s1.get_cueout(), self.cue_out)
        self.assertEqual(s1.get_ends(), s1_starts + self.length)

        # Mixed overlapping schedule datetimes (only ends is overlapping):
        s2_starts = datetime(year=2021, month=10, day=2, hour=1, minute=55)
        s2 = self.create_schedule(s2_starts)
        self.assertEqual(s2.get_cueout(), timedelta(minutes=5))
        self.assertEqual(s2.get_ends(), self.show_instance.ends)

        # Fully overlapping schedule datetimes (starts and ends are overlapping):
        s3_starts = datetime(year=2021, month=10, day=2, hour=2, minute=1)
        s3 = self.create_schedule(s3_starts)
        self.assertEqual(s3.get_cueout(), self.cue_out)
        self.assertEqual(s3.get_ends(), self.show_instance.ends)

    def test_is_valid(self):
        # Starts before the schedule ends
        s1_starts = datetime(year=2021, month=10, day=2, hour=1, minute=30)
        s1 = self.create_schedule(s1_starts)
        self.assertTrue(s1.is_valid)

        # Starts after the schedule ends
        s2_starts = datetime(year=2021, month=10, day=2, hour=3)
        s2 = self.create_schedule(s2_starts)
        self.assertFalse(s2.is_valid)
