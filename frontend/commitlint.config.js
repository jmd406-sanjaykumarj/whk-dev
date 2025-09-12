module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce type to be one of these
    'type-enum': [
      2, // Error level
      'always',
      [
        'feat', // A new feature
        'fix',  // A bug fix
        'merge', // A merge commit
        'Merge', // A merge commit (capitalized)
      ]
    ],
   
    // Subject should not start with a capital letter
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
    ],
  }
};
