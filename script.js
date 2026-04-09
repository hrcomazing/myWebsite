const chips = document.querySelectorAll('.chip');
const skillCards = document.querySelectorAll('.skill-card');
const projects = document.querySelectorAll('.project');

const applySkillFilter = (skill) => {
  const updateVisibility = (elements) => {
    elements.forEach((item) => {
      const matches = skill === 'all' || item.dataset.skill === skill;
      item.classList.toggle('is-hidden', !matches);
    });
  };

  updateVisibility(skillCards);
  updateVisibility(projects);
};

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((node) => {
      node.classList.remove('is-active');
      node.setAttribute('aria-selected', 'false');
    });

    chip.classList.add('is-active');
    chip.setAttribute('aria-selected', 'true');

    applySkillFilter(chip.dataset.skill);
  });
});

const accordions = document.querySelectorAll('.accordion');

accordions.forEach((accordion) => {
  accordion.addEventListener('toggle', () => {
    if (!accordion.open) return;

    accordions.forEach((other) => {
      if (other !== accordion) {
        other.open = false;
      }
    });
  });
});
